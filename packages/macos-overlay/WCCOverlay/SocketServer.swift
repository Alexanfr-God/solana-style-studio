import Foundation

protocol SocketServerDelegate: AnyObject {
    func didReceiveMessage(_ message: [String: Any])
}

/// Unix socket server для приёма сообщений от Native Host
class SocketServer {
    private let socketPath = "/tmp/wcc-overlay.sock"
    private var serverSocket: Int32 = -1
    private var isRunning = false
    private let queue = DispatchQueue(label: "dev.wcc.overlay.socket", qos: .userInteractive)
    
    weak var delegate: SocketServerDelegate?
    
    func start() {
        queue.async { [weak self] in
            self?.startServer()
        }
    }
    
    private func startServer() {
        // Удалить старый сокет
        unlink(socketPath)
        
        // Создать socket
        serverSocket = socket(AF_UNIX, SOCK_STREAM, 0)
        guard serverSocket >= 0 else {
            WCCLogger.log("Failed to create socket", data: ["errno": errno])
            return
        }
        
        // Bind
        var addr = sockaddr_un()
        addr.sun_family = sa_family_t(AF_UNIX)
        
        socketPath.withCString { ptr in
            withUnsafeMutablePointer(to: &addr.sun_path.0) { dest in
                _ = strcpy(dest, ptr)
            }
        }
        
        let addrLen = socklen_t(MemoryLayout<sockaddr_un>.size)
        let bindResult = withUnsafePointer(to: &addr) { ptr in
            ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockPtr in
                bind(serverSocket, sockPtr, addrLen)
            }
        }
        
        guard bindResult == 0 else {
            WCCLogger.log("Bind failed", data: ["errno": errno, "path": socketPath])
            close(serverSocket)
            return
        }
        
        // Listen
        guard listen(serverSocket, 5) == 0 else {
            WCCLogger.log("Listen failed", data: ["errno": errno])
            close(serverSocket)
            return
        }
        
        isRunning = true
        WCCLogger.log("Socket server started", data: ["path": socketPath])
        
        // Accept loop
        acceptLoop()
    }
    
    private func acceptLoop() {
        while isRunning {
            var clientAddr = sockaddr_un()
            var clientLen = socklen_t(MemoryLayout<sockaddr_un>.size)
            
            let clientSocket = withUnsafeMutablePointer(to: &clientAddr) { ptr in
                ptr.withMemoryRebound(to: sockaddr.self, capacity: 1) { sockPtr in
                    accept(serverSocket, sockPtr, &clientLen)
                }
            }
            
            guard clientSocket >= 0 else {
                if isRunning {
                    WCCLogger.log("Accept failed", data: ["errno": errno])
                }
                continue
            }
            
            handleClient(clientSocket)
            close(clientSocket)
        }
    }
    
    private func handleClient(_ socket: Int32) {
        // 1. Читаем 4 байта длины с read_exact
        guard let lengthData = readExact(socket: socket, count: 4) else {
            WCCLogger.log("Failed to read length prefix")
            return
        }
        
        let length = lengthData.withUnsafeBytes { ptr in
            ptr.load(as: UInt32.self).littleEndian
        }
        
        WCCLogger.log("Receiving message", data: ["length": length])
        
        // Sanity check
        guard length > 0 && length < 1024 * 1024 else {
            WCCLogger.log("Invalid message length", data: ["length": length])
            return
        }
        
        // 2. Читаем payload с read_exact
        guard let payloadData = readExact(socket: socket, count: Int(length)) else {
            WCCLogger.log("Failed to read payload", data: ["expectedLength": length])
            return
        }
        
        // 3. Parse JSON
        guard let json = try? JSONSerialization.jsonObject(with: payloadData) as? [String: Any] else {
            WCCLogger.log("Failed to parse JSON", data: [
                "dataLength": payloadData.count,
                "preview": String(data: payloadData.prefix(100), encoding: .utf8) ?? "?"
            ])
            return
        }
        
        WCCLogger.log("Received message", data: [
            "type": json["type"] ?? "unknown",
            "popupId": json["popupId"] ?? "?"
        ])
        
        // 4. Dispatch to main thread
        DispatchQueue.main.async { [weak self] in
            self?.delegate?.didReceiveMessage(json)
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
                WCCLogger.log("recv failed or EOF", data: [
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
    
    func stop() {
        WCCLogger.log("Stopping socket server")
        isRunning = false
        
        if serverSocket >= 0 {
            // Interrupt accept() by closing socket
            shutdown(serverSocket, SHUT_RDWR)
            close(serverSocket)
            serverSocket = -1
        }
        
        unlink(socketPath)
        WCCLogger.log("Socket server stopped")
    }
}
