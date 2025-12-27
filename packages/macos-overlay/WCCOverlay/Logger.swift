import Foundation
import os.log

/// Централизованное логирование для WCC Overlay
struct WCCLogger {
    private static let subsystem = "dev.wcc.overlay"
    private static let logger = Logger(subsystem: subsystem, category: "general")
    
    private static let logFileURL: URL = {
        let logDir = FileManager.default.homeDirectoryForCurrentUser
            .appendingPathComponent("Library/Logs/WCCOverlay")
        try? FileManager.default.createDirectory(at: logDir, withIntermediateDirectories: true)
        return logDir.appendingPathComponent("wcc.log")
    }()
    
    private static let dateFormatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()
    
    /// Логировать сообщение с optional data и correlation ID
    static func log(_ message: String, data: [String: Any]? = nil, correlationId: String? = nil) {
        let ts = dateFormatter.string(from: Date())
        var entry: [String: Any] = ["ts": ts, "msg": message]
        
        if let cid = correlationId {
            entry["correlationId"] = cid
        }
        if let d = data {
            entry["data"] = d
        }
        
        let jsonData = try? JSONSerialization.data(withJSONObject: entry, options: [])
        let line = String(data: jsonData ?? Data(), encoding: .utf8) ?? message
        
        // OSLog для system console
        logger.info("\(line)")
        
        // File log для persistence
        appendToFile(line + "\n")
        
        // Print для Xcode console
        print("[WCC] \(line)")
    }
    
    private static func appendToFile(_ text: String) {
        guard let data = text.data(using: .utf8) else { return }
        
        if FileManager.default.fileExists(atPath: logFileURL.path) {
            if let handle = try? FileHandle(forWritingTo: logFileURL) {
                handle.seekToEndOfFile()
                handle.write(data)
                try? handle.close()
            }
        } else {
            try? data.write(to: logFileURL)
        }
    }
}
