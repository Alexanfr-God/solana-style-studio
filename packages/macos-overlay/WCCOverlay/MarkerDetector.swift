import CoreGraphics
import Foundation

/// Bounding box из 4 угловых маркеров
struct MarkerBBox {
    let topLeft: CGPoint
    let topRight: CGPoint
    let bottomLeft: CGPoint
    let bottomRight: CGPoint
    
    var rect: CGRect {
        let minX = min(topLeft.x, bottomLeft.x)
        let maxX = max(topRight.x, bottomRight.x)
        let minY = min(topLeft.y, topRight.y)
        let maxY = max(bottomLeft.y, bottomRight.y)
        return CGRect(x: minX, y: minY, width: maxX - minX, height: maxY - minY)
    }
    
    /// Для SAM2 API: [x1, y1, x2, y2]
    var boxArray: [Int] {
        let r = rect
        return [Int(r.minX), Int(r.minY), Int(r.maxX), Int(r.maxY)]
    }
}

/// Детектор magenta маркеров в изображении
class MarkerDetector {
    private let correlationId: String
    
    // Пороги для детекции magenta (RGB: 255, 0, 255)
    // Opacity 0.6 на тёмном фоне даёт примерно R>150, G<100, B>150
    private let rThreshold: UInt8 = 150
    private let gMaxThreshold: UInt8 = 100
    private let bThreshold: UInt8 = 150
    
    // Минимальное количество пикселей в кластере
    private let minClusterSize = 4
    
    init(correlationId: String = "") {
        self.correlationId = correlationId
    }
    
    /// Найти 4 угловых маркера и вернуть bounding box
    func detectMarkers(in image: CGImage) -> MarkerBBox? {
        let width = image.width
        let height = image.height
        
        guard let data = image.dataProvider?.data,
              let ptr = CFDataGetBytePtr(data) else {
            WCCLogger.log("Failed to get image data", correlationId: correlationId)
            return nil
        }
        
        let bytesPerPixel = image.bitsPerPixel / 8
        let bytesPerRow = image.bytesPerRow
        
        var magentaPoints: [CGPoint] = []
        
        // Сканируем изображение с шагом 2 для ускорения
        let step = 2
        for y in stride(from: 0, to: height, by: step) {
            for x in stride(from: 0, to: width, by: step) {
                let offset = y * bytesPerRow + x * bytesPerPixel
                
                // BGRA format (ScreenCaptureKit default)
                let b = ptr[offset]
                let g = ptr[offset + 1]
                let r = ptr[offset + 2]
                
                // Проверка на magenta
                if r >= rThreshold && g <= gMaxThreshold && b >= bThreshold {
                    magentaPoints.append(CGPoint(x: CGFloat(x), y: CGFloat(y)))
                }
            }
        }
        
        guard magentaPoints.count >= minClusterSize else {
            // Не логируем каждый кадр без маркеров
            return nil
        }
        
        // Кластеризация по квадрантам
        let centerX = CGFloat(width) / 2
        let centerY = CGFloat(height) / 2
        
        var topLeft: [CGPoint] = []
        var topRight: [CGPoint] = []
        var bottomLeft: [CGPoint] = []
        var bottomRight: [CGPoint] = []
        
        for point in magentaPoints {
            if point.x < centerX && point.y < centerY {
                topLeft.append(point)
            } else if point.x >= centerX && point.y < centerY {
                topRight.append(point)
            } else if point.x < centerX && point.y >= centerY {
                bottomLeft.append(point)
            } else {
                bottomRight.append(point)
            }
        }
        
        // Проверить что все 4 угла имеют маркеры
        guard topLeft.count >= minClusterSize / 4,
              topRight.count >= minClusterSize / 4,
              bottomLeft.count >= minClusterSize / 4,
              bottomRight.count >= minClusterSize / 4 else {
            WCCLogger.log("Not all corners found", data: [
                "tl": topLeft.count,
                "tr": topRight.count,
                "bl": bottomLeft.count,
                "br": bottomRight.count,
                "total": magentaPoints.count
            ], correlationId: correlationId)
            return nil
        }
        
        // Вычислить центроид каждого кластера
        func centroid(_ points: [CGPoint]) -> CGPoint {
            let sum = points.reduce(CGPoint.zero) { 
                CGPoint(x: $0.x + $1.x, y: $0.y + $1.y) 
            }
            return CGPoint(
                x: sum.x / CGFloat(points.count), 
                y: sum.y / CGFloat(points.count)
            )
        }
        
        let tl = centroid(topLeft)
        let tr = centroid(topRight)
        let bl = centroid(bottomLeft)
        let br = centroid(bottomRight)
        
        let bbox = MarkerBBox(topLeft: tl, topRight: tr, bottomLeft: bl, bottomRight: br)
        
        WCCLogger.log("Markers detected", data: [
            "rect": [
                "x": Int(bbox.rect.origin.x),
                "y": Int(bbox.rect.origin.y),
                "w": Int(bbox.rect.width),
                "h": Int(bbox.rect.height)
            ],
            "points": magentaPoints.count
        ], correlationId: correlationId)
        
        return bbox
    }
}
