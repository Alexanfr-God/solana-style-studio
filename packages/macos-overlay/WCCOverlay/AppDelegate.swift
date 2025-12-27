import Cocoa
import CoreMedia

@main
class AppDelegate: NSObject, NSApplicationDelegate {
    
    // UI
    private var overlayWindow: OverlayWindow!
    private var overlayView: OverlayView!
    
    // Components
    private var socketServer: SocketServer!
    private var screenCapture: ScreenCapture!
    private var markerDetector: MarkerDetector!
    private var samClient: SAMClient!
    
    // State
    private var currentCorrelationId: String = ""
    private var isCapturing = false
    
    // ROI по умолчанию: верхняя правая часть экрана (можно менять)
    private var captureROI = CGRect(x: 800, y: 0, width: 600, height: 800)
    
    // Skin image
    private var skinImage: NSImage?
    
    func applicationDidFinishLaunching(_ notification: Notification) {
        WCCLogger.log("=== WCC Overlay App Started ===", data: [
            "version": "1.0.0",
            "pid": ProcessInfo.processInfo.processIdentifier
        ])
        
        // 1. Проверить разрешения
        checkPermissions()
        
        // 2. Загрузить skin image
        loadSkinImage()
        
        // 3. Создать overlay window на весь экран
        setupOverlayWindow()
        
        // 4. Инициализировать компоненты
        setupComponents()
        
        WCCLogger.log("All components initialized")
    }
    
    // MARK: - Setup
    
    private func checkPermissions() {
        WCCLogger.log("Checking Screen Recording permissions...")
        
        let hasAccess = CGPreflightScreenCaptureAccess()
        WCCLogger.log("Screen Recording permission", data: ["hasAccess": hasAccess])
        
        if !hasAccess {
            WCCLogger.log("Requesting Screen Recording permission...")
            let granted = CGRequestScreenCaptureAccess()
            WCCLogger.log("Permission request result", data: ["granted": granted])
            
            if !granted {
                showPermissionAlert()
            }
        }
    }
    
    private func showPermissionAlert() {
        DispatchQueue.main.async {
            let alert = NSAlert()
            alert.messageText = "Screen Recording Permission Required"
            alert.informativeText = "Please enable Screen Recording for WCCOverlay in System Preferences → Privacy & Security → Screen Recording, then restart the app."
            alert.alertStyle = .warning
            alert.addButton(withTitle: "Open System Preferences")
            alert.addButton(withTitle: "Quit")
            
            let response = alert.runModal()
            if response == .alertFirstButtonReturn {
                if let url = URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture") {
                    NSWorkspace.shared.open(url)
                }
            }
            // Не выходим, пользователь может выдать разрешение и перезапустить
        }
    }
    
    private func loadSkinImage() {
        // Попробовать загрузить из bundle
        if let bundlePath = Bundle.main.path(forResource: "proton-dark", ofType: "png") {
            skinImage = NSImage(contentsOfFile: bundlePath)
            WCCLogger.log("Loaded skin from bundle", data: ["path": bundlePath])
        }
        
        // Fallback: загрузить из themes/
        if skinImage == nil {
            let themesPath = FileManager.default.currentDirectoryPath + "/themes/proton-dark.png"
            skinImage = NSImage(contentsOfFile: themesPath)
            if skinImage != nil {
                WCCLogger.log("Loaded skin from themes/", data: ["path": themesPath])
            }
        }
        
        if skinImage == nil {
            WCCLogger.log("WARNING: No skin image found, using placeholder")
            // Создать placeholder
            skinImage = NSImage(size: NSSize(width: 350, height: 500))
        }
    }
    
    private func setupOverlayWindow() {
        guard let screen = NSScreen.main else {
            WCCLogger.log("ERROR: No main screen")
            return
        }
        
        let screenFrame = screen.frame
        
        overlayWindow = OverlayWindow(
            contentRect: screenFrame,
            styleMask: .borderless,
            backing: .buffered,
            defer: false
        )
        
        overlayView = OverlayView(frame: screenFrame)
        overlayWindow.contentView = overlayView
        
        WCCLogger.log("Overlay window setup", data: [
            "screenFrame": "\(screenFrame)"
        ])
    }
    
    private func setupComponents() {
        // Socket server
        socketServer = SocketServer()
        socketServer.delegate = self
        socketServer.start()
        
        // Screen capture
        screenCapture = ScreenCapture()
        screenCapture.delegate = self
        
        // SAM client
        samClient = SAMClient()
    }
    
    // MARK: - Message Handling
    
    private func handleOpen(popupId: String) {
        guard !isCapturing else {
            WCCLogger.log("Already capturing, ignoring OPEN", correlationId: popupId)
            return
        }
        
        currentCorrelationId = popupId
        markerDetector = MarkerDetector(correlationId: popupId)
        isCapturing = true
        
        // Показать overlay window
        overlayWindow.show()
        
        // Запустить capture
        Task {
            do {
                try await screenCapture.start(roi: captureROI, correlationId: popupId)
            } catch {
                WCCLogger.log("Failed to start capture", data: [
                    "error": error.localizedDescription
                ], correlationId: popupId)
                isCapturing = false
            }
        }
    }
    
    private func handleClose(popupId: String) {
        WCCLogger.log("Handling CLOSE", correlationId: popupId)
        
        isCapturing = false
        screenCapture.stop()
        overlayView.clear()
        overlayWindow.hide()
        currentCorrelationId = ""
    }
    
    func applicationWillTerminate(_ notification: Notification) {
        WCCLogger.log("Application terminating")
        socketServer.stop()
        screenCapture.stop()
    }
}

// MARK: - SocketServerDelegate

extension AppDelegate: SocketServerDelegate {
    func didReceiveMessage(_ message: [String: Any]) {
        guard let type = message["type"] as? String else {
            WCCLogger.log("Message without type", data: message)
            return
        }
        
        let popupId = message["popupId"] as? String ?? "unknown"
        
        WCCLogger.log("Received \(type)", data: [
            "popupId": popupId,
            "ts": message["ts"] ?? 0
        ], correlationId: popupId)
        
        switch type {
        case "OPEN":
            handleOpen(popupId: popupId)
            
        case "PING":
            // Keepalive - продолжаем capture
            break
            
        case "CLOSE":
            handleClose(popupId: popupId)
            
        default:
            WCCLogger.log("Unknown message type", data: ["type": type])
        }
    }
}

// MARK: - ScreenCaptureDelegate

extension AppDelegate: ScreenCaptureDelegate {
    func didCaptureFrame(_ image: CGImage, at time: CMTime) {
        guard isCapturing else { return }
        
        // 1. Detect markers
        guard let bbox = markerDetector.detectMarkers(in: image) else {
            // Маркеры не найдены - пропускаем кадр (не логируем каждый раз)
            return
        }
        
        // 2. Crop ROI вокруг bbox с padding
        let padding: CGFloat = 10
        let cropRect = bbox.rect.insetBy(dx: -padding, dy: -padding)
            .intersection(CGRect(x: 0, y: 0, width: image.width, height: image.height))
        
        guard let croppedImage = image.cropping(to: cropRect) else {
            WCCLogger.log("Failed to crop image", correlationId: currentCorrelationId)
            return
        }
        
        // 3. Отправить в SAM2 (async)
        Task {
            do {
                // Передаём bbox относительно cropped image
                let relativeBbox = CGRect(
                    x: padding,
                    y: padding,
                    width: bbox.rect.width,
                    height: bbox.rect.height
                )
                
                let (mask, maskW, maskH) = try await samClient.segment(
                    image: croppedImage,
                    bbox: relativeBbox,
                    correlationId: currentCorrelationId
                )
                
                // 4. Обновить overlay на main thread
                await MainActor.run {
                    guard let skin = skinImage else { return }
                    
                    // Конвертировать из ROI координат в screen координаты
                    let screenRect = CGRect(
                        x: captureROI.origin.x + cropRect.origin.x,
                        y: captureROI.origin.y + cropRect.origin.y,
                        width: CGFloat(maskW),
                        height: CGFloat(maskH)
                    )
                    
                    overlayView.updateSkin(
                        skin,
                        mask: mask,
                        maskSize: CGSize(width: maskW, height: maskH),
                        rect: screenRect
                    )
                }
            } catch {
                WCCLogger.log("SAM2 error", data: [
                    "error": error.localizedDescription
                ], correlationId: currentCorrelationId)
            }
        }
    }
}
