import Cocoa

/// Прозрачное always-on-top окно для overlay
class OverlayWindow: NSWindow {
    
    override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask,
                  backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
        super.init(contentRect: contentRect, styleMask: .borderless, backing: .buffered, defer: flag)
        
        // Прозрачность
        isOpaque = false
        backgroundColor = .clear
        hasShadow = false
        
        // Always on top (выше всех окон)
        level = .screenSaver
        
        // Click-through (клики проходят насквозь)
        ignoresMouseEvents = true
        
        // На всех spaces
        collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary, .stationary]
        
        WCCLogger.log("Overlay window created", data: [
            "frame": "\(contentRect)",
            "level": "screenSaver"
        ])
    }
    
    /// Показать overlay
    func show() {
        orderFrontRegardless()
        WCCLogger.log("Overlay window shown")
    }
    
    /// Скрыть overlay
    func hide() {
        orderOut(nil)
        WCCLogger.log("Overlay window hidden")
    }
}
