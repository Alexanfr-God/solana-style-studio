import Cocoa
import CoreGraphics

/// View для рендеринга PNG skin с маской
class OverlayView: NSView {
    private var skinImage: NSImage?
    private var maskData: Data?
    private var maskSize: CGSize = .zero
    private var popupRect: CGRect = .zero
    
    override var isFlipped: Bool { true }  // Координаты сверху вниз
    
    override func draw(_ dirtyRect: NSRect) {
        guard let skin = skinImage,
              let mask = maskData,
              let context = NSGraphicsContext.current?.cgContext else {
            return
        }
        
        // Сохранить graphics state
        context.saveGState()
        defer { context.restoreGState() }
        
        // 1. Создать CGImage маску из binary data
        guard let maskCGImage = createMaskCGImage(from: mask, size: maskSize) else {
            WCCLogger.log("Failed to create mask CGImage")
            return
        }
        
        // 2. Определить rect для маски на экране
        let maskRect = CGRect(
            x: popupRect.origin.x,
            y: popupRect.origin.y,
            width: maskSize.width,
            height: maskSize.height
        )
        
        // 3. === FIX: Clip context по маске ===
        // CGContext.clip(to:mask:) использует grayscale image как alpha mask
        // Белые пиксели (255) = видимые, чёрные (0) = прозрачные
        context.clip(to: maskRect, mask: maskCGImage)
        
        // 4. Рисовать PNG skin ВНУТРИ маски (clipped)
        if let skinCGImage = skin.cgImage(forProposedRect: nil, context: nil, hints: nil) {
            // Рисуем skin в popupRect (может отличаться от maskRect если scaling)
            context.draw(skinCGImage, in: popupRect)
            
            WCCLogger.log("Rendered skin with mask clip", data: [
                "maskRect": "\(maskRect)",
                "popupRect": "\(popupRect)",
                "skinSize": "\(skin.size)"
            ])
        }
    }
    
    /// Создать CGImage маску из binary data (0/255 bytes)
    private func createMaskCGImage(from data: Data, size: CGSize) -> CGImage? {
        let width = Int(size.width)
        let height = Int(size.height)
        
        // Проверка размера данных
        let expectedSize = width * height
        guard data.count >= expectedSize else {
            WCCLogger.log("Mask data too small", data: [
                "expected": expectedSize,
                "actual": data.count,
                "dimensions": "\(width)x\(height)"
            ])
            return nil
        }
        
        // Grayscale color space для маски
        let colorSpace = CGColorSpaceCreateDeviceGray()
        
        // Создать data provider из mask bytes
        // Используем только нужное количество байт
        let maskBytes = data.prefix(expectedSize)
        guard let provider = CGDataProvider(data: maskBytes as CFData) else {
            WCCLogger.log("Failed to create CGDataProvider")
            return nil
        }
        
        // Создать CGImage
        // bitsPerComponent: 8 (один байт на пиксель)
        // bitsPerPixel: 8
        // bytesPerRow: width
        let maskImage = CGImage(
            width: width,
            height: height,
            bitsPerComponent: 8,
            bitsPerPixel: 8,
            bytesPerRow: width,
            space: colorSpace,
            bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.none.rawValue),
            provider: provider,
            decode: nil,
            shouldInterpolate: false,
            intent: .defaultIntent
        )
        
        return maskImage
    }
    
    /// Обновить skin и mask
    func updateSkin(_ image: NSImage, mask: Data, maskSize: CGSize, rect: CGRect) {
        self.skinImage = image
        self.maskData = mask
        self.maskSize = maskSize
        self.popupRect = rect
        
        // Trigger redraw
        needsDisplay = true
        
        WCCLogger.log("Overlay updated", data: [
            "rect": "\(rect)",
            "maskSize": "\(maskSize)",
            "maskBytes": mask.count
        ])
    }
    
    /// Очистить overlay
    func clear() {
        skinImage = nil
        maskData = nil
        needsDisplay = true
        WCCLogger.log("Overlay cleared")
    }
}
