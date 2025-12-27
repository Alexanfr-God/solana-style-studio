import ScreenCaptureKit
import CoreMedia
import CoreImage
import CoreGraphics

protocol ScreenCaptureDelegate: AnyObject {
    func didCaptureFrame(_ image: CGImage, at time: CMTime)
}

/// Screen capture с ScreenCaptureKit (ROI only)
class ScreenCapture: NSObject {
    private var stream: SCStream?
    private var streamOutput: StreamOutput?
    weak var delegate: ScreenCaptureDelegate?
    
    private var roi: CGRect = .zero
    private var correlationId: String = ""
    
    /// Проверить разрешение Screen Recording
    static func checkPermissions() -> Bool {
        let hasAccess = CGPreflightScreenCaptureAccess()
        WCCLogger.log("Screen Recording permission check", data: ["hasAccess": hasAccess])
        return hasAccess
    }
    
    /// Запросить разрешение Screen Recording (откроет System Preferences)
    static func requestPermissions() -> Bool {
        WCCLogger.log("Requesting Screen Recording permission...")
        let granted = CGRequestScreenCaptureAccess()
        WCCLogger.log("Screen Recording permission result", data: ["granted": granted])
        return granted
    }
    
    func start(roi: CGRect, correlationId: String) async throws {
        // Проверка permission перед запуском
        guard CGPreflightScreenCaptureAccess() else {
            WCCLogger.log("Screen Recording permission DENIED", correlationId: correlationId)
            throw CaptureError.permissionDenied
        }
        
        self.roi = roi
        self.correlationId = correlationId
        
        WCCLogger.log("Starting screen capture", data: [
            "roi": ["x": roi.origin.x, "y": roi.origin.y, "w": roi.width, "h": roi.height],
            "permissionStatus": "granted"
        ], correlationId: correlationId)
        
        // Получить список displays
        let content = try await SCShareableContent.current
        guard let display = content.displays.first else {
            WCCLogger.log("No display found", correlationId: correlationId)
            throw CaptureError.noDisplay
        }
        
        WCCLogger.log("Found display", data: [
            "width": display.width,
            "height": display.height
        ], correlationId: correlationId)
        
        // Конфигурация
        let config = SCStreamConfiguration()
        config.sourceRect = roi  // ROI only!
        config.width = Int(roi.width)
        config.height = Int(roi.height)
        config.minimumFrameInterval = CMTime(value: 1, timescale: 15) // 15 FPS
        config.pixelFormat = kCVPixelFormatType_32BGRA
        config.showsCursor = false
        config.capturesAudio = false
        
        // Фильтр - только этот display
        let filter = SCContentFilter(display: display, excludingWindows: [])
        
        // Создать stream output
        streamOutput = StreamOutput(delegate: delegate, correlationId: correlationId)
        
        // Создать и запустить stream
        stream = SCStream(filter: filter, configuration: config, delegate: nil)
        
        try stream?.addStreamOutput(
            streamOutput!,
            type: .screen,
            sampleHandlerQueue: DispatchQueue.global(qos: .userInteractive)
        )
        
        try await stream?.startCapture()
        
        WCCLogger.log("Screen capture STARTED", data: [
            "fps": 15,
            "format": "BGRA"
        ], correlationId: correlationId)
    }
    
    func stop() {
        WCCLogger.log("Stopping screen capture", correlationId: correlationId)
        
        Task {
            try? await stream?.stopCapture()
        }
        
        stream = nil
        streamOutput = nil
        
        WCCLogger.log("Screen capture STOPPED", correlationId: correlationId)
    }
    
    enum CaptureError: Error, LocalizedError {
        case noDisplay
        case permissionDenied
        
        var errorDescription: String? {
            switch self {
            case .noDisplay: return "No display found"
            case .permissionDenied: return "Screen Recording permission denied"
            }
        }
    }
}

/// Stream output handler
private class StreamOutput: NSObject, SCStreamOutput {
    weak var delegate: ScreenCaptureDelegate?
    private let correlationId: String
    private var frameCount = 0
    private let startTime = Date()
    
    init(delegate: ScreenCaptureDelegate?, correlationId: String) {
        self.delegate = delegate
        self.correlationId = correlationId
    }
    
    func stream(_ stream: SCStream, didOutputSampleBuffer sampleBuffer: CMSampleBuffer, of type: SCStreamOutputType) {
        guard type == .screen else { return }
        
        frameCount += 1
        
        // Логировать каждые 30 кадров (~2 секунды при 15fps)
        if frameCount % 30 == 0 {
            let elapsed = Date().timeIntervalSince(startTime)
            let fps = Double(frameCount) / elapsed
            WCCLogger.log("Capture stats", data: [
                "frameCount": frameCount,
                "elapsedSec": String(format: "%.1f", elapsed),
                "avgFps": String(format: "%.1f", fps)
            ], correlationId: correlationId)
        }
        
        // Extract CGImage from sample buffer
        guard let imageBuffer = CMSampleBufferGetImageBuffer(sampleBuffer) else {
            return
        }
        
        let ciImage = CIImage(cvPixelBuffer: imageBuffer)
        let context = CIContext(options: [.useSoftwareRenderer: false])
        
        guard let cgImage = context.createCGImage(ciImage, from: ciImage.extent) else {
            return
        }
        
        let time = CMSampleBufferGetPresentationTimeStamp(sampleBuffer)
        delegate?.didCaptureFrame(cgImage, at: time)
    }
}
