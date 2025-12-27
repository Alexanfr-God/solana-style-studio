import Foundation
import AppKit

/// SAM2 API request
struct SAMRequest: Codable {
    let requestId: String
    let width: Int
    let height: Int
    let imageBase64: String
    let bbox: BBox?
    
    struct BBox: Codable {
        let x1: Int
        let y1: Int
        let x2: Int
        let y2: Int
    }
}

/// SAM2 API response
struct SAMResponse: Codable {
    let requestId: String
    let maskWidth: Int
    let maskHeight: Int
    let maskBase64: String
    let inferenceTimeMs: Double?
    let error: String?
}

/// Клиент для SAM2 Python service через Unix socket
class SAMClient {
    private let socketPath = "/tmp/wcc-sam2.sock"
    
    /// Сегментировать изображение с использованием bbox
    func segment(image: CGImage, bbox: CGRect, correlationId: String) async throws -> (mask: Data, width: Int, height: Int) {
        let startTime = Date()
        
        // Конвертировать CGImage в PNG
        let imageData = try imageToData(image)
        let base64 = imageData.base64EncodedString()
        
        // Создать request с bbox
        let request = SAMRequest(
            requestId: correlationId,
            width: image.width,
            height: image.height,
            imageBase64: base64,
            bbox: SAMRequest.BBox(
                x1: Int(bbox.origin.x),
                y1: Int(bbox.origin.y),
                x2: Int(bbox.origin.x + bbox.width),
                y2: Int(bbox.origin.y + bbox.height)
            )
        )
        
        WCCLogger.log("Sending to SAM2", data: [
            "width": image.width,
            "height": image.height,
            "dataSize": imageData.count,
            "bbox": [Int(bbox.minX), Int(bbox.minY), Int(bbox.maxX), Int(bbox.maxY)]
        ], correlationId: correlationId)
        
        // Отправить через Unix socket
        let response = try await sendToSocket(request)
        
        // Проверить на ошибку
        if let error = response.error {
            throw SAMError.serverError(error)
        }
        
        // Декодировать mask
        guard let maskData = Data(base64Encoded: response.maskBase64) else {
            throw SAMError.invalidMaskData
        }
        
        let duration = Date().timeIntervalSince(startTime) * 1000
        WCCLogger.log("SAM2 response received", data: [
            "inferenceTimeMs": response.inferenceTimeMs ?? 0,
            "totalTimeMs": String(format: "%.1f", duration),
            "maskSize": maskData.count,
            "maskDimensions": "\(response.maskWidth)x\(response.maskHeight)"
        ], correlationId: correlationId)
        
        return (maskData, response.maskWidth, response.maskHeight)
    }
    
    /// Конвертировать CGImage в PNG data
    private func imageToData(_ image: CGImage) throws -> Data {
        let bitmapRep = NSBitmapImageRep(cgImage: image)
        guard let pngData = bitmapRep.representation(using: .png, properties: [:]) else {
            throw SAMError.imageConversionFailed
        }
        return pngData
    }
    
    /// Отправить request через Unix socket с read_exact
    private func sendToSocket(_ request: SAMRequest) async throws -> SAMResponse {
        return try await withCheckedThrowingContinuation { continuation in
            DispatchQueue.global(qos: .userInitiated).async {
                let sock = socket(AF_UNIX, SOCK_STREAM, 0)
                guard sock >= 0 else {
                    continuation.resume(throwing: SAMError.socketError(errno))
                    return
                }
                
                defer { close(sock) }
                
                // Connect
                var addr = sockaddr_un()
                addr.sun_family = sa_family_t(AF_UNIX)
                self.socketPath.withCString { ptr in
                    withUnsafeMutablePointer(to: &addr.sun_path.0) { dest in
                        _ = strcpy(dest, ptr)
                    }
                }
                
                let addrLen = socklen_t(MemoryLayout<sockaddr_un>.size)
                let connectResult = withUnsafePointer(to: &addr) { ptr in
                    ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockPtr in
                        connect(sock, sockPtr, addrLen)
                    }
                }
                
                guard connectResult == 0 else {
                    continuation.resume(throwing: SAMError.connectionFailed(errno))
                    return
                }
                
                do {
                    // Encode request
                    let jsonData = try JSONEncoder().encode(request)
                    
                    // Send length prefix (4 bytes, little-endian)
                    var length = UInt32(jsonData.count).littleEndian
                    let sendLengthResult = withUnsafeBytes(of: &length) { ptr in
                        send(sock, ptr.baseAddress, 4, 0)
                    }
                    guard sendLengthResult == 4 else {
                        continuation.resume(throwing: SAMError.sendFailed)
                        return
                    }
                    
                    // Send JSON body
                    let sendBodyResult = jsonData.withUnsafeBytes { ptr in
                        send(sock, ptr.baseAddress, jsonData.count, 0)
                    }
                    guard sendBodyResult == jsonData.count else {
                        continuation.resume(throwing: SAMError.sendFailed)
                        return
                    }
                    
                    // === FIX: read_exact для response ===
                    
                    // 1. Читаем length prefix (4 bytes) с read_exact
                    guard let lengthData = self.readExact(socket: sock, count: 4) else {
                        continuation.resume(throwing: SAMError.receiveError)
                        return
                    }
                    
                    let responseLength = lengthData.withUnsafeBytes { ptr in
                        ptr.load(as: UInt32.self).littleEndian
                    }
                    
                    // Sanity check
                    guard responseLength > 0 && responseLength < 100 * 1024 * 1024 else {
                        continuation.resume(throwing: SAMError.invalidResponseLength(Int(responseLength)))
                        return
                    }
                    
                    // 2. Читаем body с read_exact
                    guard let responseData = self.readExact(socket: sock, count: Int(responseLength)) else {
                        continuation.resume(throwing: SAMError.receiveError)
                        return
                    }
                    
                    // Decode response
                    let response = try JSONDecoder().decode(SAMResponse.self, from: responseData)
                    continuation.resume(returning: response)
                    
                } catch {
                    continuation.resume(throwing: error)
                }
            }
        }
    }
    
    /// Читать ровно count байт из сокета (защита от partial reads)
    private func readExact(socket sock: Int32, count: Int) -> Data? {
        var data = Data(count: count)
        var totalRead = 0
        
        while totalRead < count {
            let result = data.withUnsafeMutableBytes { ptr -> Int in
                guard let baseAddress = ptr.baseAddress else { return -1 }
                let dest = baseAddress.advanced(by: totalRead)
                return recv(sock, dest, count - totalRead, 0)
            }
            
            if result <= 0 {
                WCCLogger.log("SAM recv failed", data: [
                    "errno": errno,
                    "result": result,
                    "totalRead": totalRead,
                    "expected": count
                ])
                return nil
            }
            totalRead += result
        }
        
        return data
    }
    
    enum SAMError: Error, LocalizedError {
        case socketError(Int32)
        case connectionFailed(Int32)
        case imageConversionFailed
        case invalidMaskData
        case receiveError
        case sendFailed
        case invalidResponseLength(Int)
        case serverError(String)
        
        var errorDescription: String? {
            switch self {
            case .socketError(let errno): return "Socket creation failed: \(errno)"
            case .connectionFailed(let errno): return "Connection failed: \(errno)"
            case .imageConversionFailed: return "Failed to convert image to PNG"
            case .invalidMaskData: return "Invalid mask data in response"
            case .receiveError: return "Failed to receive response"
            case .sendFailed: return "Failed to send request"
            case .invalidResponseLength(let len): return "Invalid response length: \(len)"
            case .serverError(let msg): return "SAM2 server error: \(msg)"
            }
        }
    }
}
