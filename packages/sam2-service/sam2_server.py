#!/usr/bin/env python3
"""
SAM2 Segmentation Service
Использует официальный facebookresearch/sam2
Unix socket API для локального использования.

Fixes applied:
- Абсолютные пути для MODEL_CFG и CHECKPOINT
- box= prompt вместо points для стабильности
"""

import sys
import os
import json
import struct
import socket
import base64
import time
import uuid
import traceback
from datetime import datetime
from io import BytesIO
from pathlib import Path

import numpy as np
from PIL import Image
import torch

# ========== АБСОЛЮТНЫЕ ПУТИ ==========

SCRIPT_DIR = Path(__file__).parent.resolve()

# SAM2 repo path (как submodule в vendor/)
SAM2_PATH = SCRIPT_DIR / "vendor" / "sam2"

# Добавить sam2 в path
if SAM2_PATH.exists():
    sys.path.insert(0, str(SAM2_PATH))
    print(f"[SAM2] Added to path: {SAM2_PATH}", file=sys.stderr)
else:
    print(f"[SAM2] ERROR: SAM2 not found at {SAM2_PATH}", file=sys.stderr)
    print(f"[SAM2] Run: git clone https://github.com/facebookresearch/sam2.git {SAM2_PATH}", file=sys.stderr)
    sys.exit(1)

# Конфигурация - ВСЕ ПУТИ АБСОЛЮТНЫЕ
SOCKET_PATH = "/tmp/wcc-sam2.sock"
CHECKPOINT = SCRIPT_DIR / "checkpoints" / "sam2.1_hiera_tiny.pt"
MODEL_CFG = SAM2_PATH / "sam2" / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
LOG_DIR = Path.home() / "Library" / "Logs" / "WCCOverlay"
LOG_FILE = LOG_DIR / "sam2-service.log"

# Создать директорию логов
LOG_DIR.mkdir(parents=True, exist_ok=True)


def log(msg: str, data: dict = None, request_id: str = None):
    """Structured JSON logging"""
    entry = {
        "ts": datetime.utcnow().isoformat() + "Z",
        "msg": msg
    }
    if request_id:
        entry["requestId"] = request_id
    if data:
        entry.update(data)
    
    line = json.dumps(entry)
    print(line, flush=True)
    
    try:
        with open(LOG_FILE, "a") as f:
            f.write(line + "\n")
    except Exception as e:
        print(f"Log file error: {e}", file=sys.stderr)


def validate_paths():
    """Проверить существование всех путей"""
    log("Validating paths...", data={
        "script_dir": str(SCRIPT_DIR),
        "sam2_path": str(SAM2_PATH),
        "checkpoint": str(CHECKPOINT),
        "model_cfg": str(MODEL_CFG)
    })
    
    errors = []
    
    if not SAM2_PATH.exists():
        errors.append(f"SAM2 repo not found: {SAM2_PATH}")
    
    if not CHECKPOINT.exists():
        errors.append(f"Checkpoint not found: {CHECKPOINT}")
        print(f"\n[SAM2] ERROR: Checkpoint not found!", file=sys.stderr)
        print(f"[SAM2] Run: ./download_checkpoint.sh\n", file=sys.stderr)
    
    if not MODEL_CFG.exists():
        # Попробовать альтернативный путь (структура может отличаться)
        alt_cfg = SAM2_PATH / "configs" / "sam2.1" / "sam2.1_hiera_t.yaml"
        if alt_cfg.exists():
            global MODEL_CFG
            MODEL_CFG = alt_cfg
            log("Using alternative config path", data={"path": str(MODEL_CFG)})
        else:
            errors.append(f"Model config not found: {MODEL_CFG}")
    
    if errors:
        for err in errors:
            log("PATH ERROR", data={"error": err})
            print(f"[SAM2] ERROR: {err}", file=sys.stderr)
        sys.exit(1)
    
    log("All paths validated successfully")


class SAM2Service:
    def __init__(self):
        self.predictor = None
        self.device = self._detect_device()
    
    def _detect_device(self) -> str:
        if torch.cuda.is_available():
            device = "cuda"
        elif hasattr(torch.backends, 'mps') and torch.backends.mps.is_available():
            device = "mps"
        else:
            device = "cpu"
        log("Detected device", data={"device": device})
        return device
    
    def load_model(self):
        """Загрузить SAM2 модель"""
        log("Loading SAM2 model...", data={
            "checkpoint": str(CHECKPOINT),
            "config": str(MODEL_CFG),
            "device": self.device
        })
        
        start = time.time()
        
        # Официальные импорты SAM2
        try:
            from sam2.build_sam import build_sam2
            from sam2.sam2_image_predictor import SAM2ImagePredictor
        except ImportError as e:
            log("Import error", data={"error": str(e)})
            print(f"\n[SAM2] Import error: {e}", file=sys.stderr)
            print(f"[SAM2] Run: cd {SAM2_PATH} && pip install -e .\n", file=sys.stderr)
            sys.exit(1)
        
        # Build SAM2 model
        sam2_model = build_sam2(
            str(MODEL_CFG),
            str(CHECKPOINT),
            device=self.device
        )
        self.predictor = SAM2ImagePredictor(sam2_model)
        
        load_time = (time.time() - start) * 1000
        log("Model loaded successfully", data={
            "loadTimeMs": round(load_time, 1),
            "device": self.device
        })
    
    def segment(self, image: Image.Image, request_id: str, bbox: dict = None) -> tuple:
        """
        Сегментация изображения.
        Используем box= prompt (точнее и стабильнее чем points).
        """
        start = time.time()
        
        # Конвертировать в numpy array
        img_array = np.array(image)
        h, w = img_array.shape[:2]
        
        log("Processing image", data={
            "width": w,
            "height": h,
            "channels": img_array.shape[2] if len(img_array.shape) > 2 else 1,
            "hasBbox": bbox is not None
        }, request_id=request_id)
        
        with torch.inference_mode():
            # Set image
            if self.device == "cuda":
                with torch.autocast("cuda", dtype=torch.bfloat16):
                    self.predictor.set_image(img_array)
            else:
                self.predictor.set_image(img_array)
            
            # ========== FIX: Использовать box= вместо points ==========
            if bbox:
                # bbox формат: {"x1": 10, "y1": 10, "x2": 390, "y2": 590}
                box = np.array([
                    bbox.get("x1", 0),
                    bbox.get("y1", 0),
                    bbox.get("x2", w),
                    bbox.get("y2", h)
                ], dtype=np.float32)
                
                log("Using box prompt", data={
                    "box": box.tolist()
                }, request_id=request_id)
                
                masks, scores, logits = self.predictor.predict(
                    box=box,
                    multimask_output=False
                )
            else:
                # Fallback: использовать весь image как box
                box = np.array([0, 0, w, h], dtype=np.float32)
                
                log("Using full image as box (no bbox provided)", data={
                    "box": box.tolist()
                }, request_id=request_id)
                
                masks, scores, logits = self.predictor.predict(
                    box=box,
                    multimask_output=False
                )
        
        # Получить маску
        mask = masks[0]  # Shape: (H, W), dtype: bool
        score = float(scores[0]) if len(scores) > 0 else 0.0
        
        inference_time = (time.time() - start) * 1000
        
        log("Inference complete", data={
            "inferenceTimeMs": round(inference_time, 1),
            "maskShape": list(mask.shape),
            "maskSum": int(mask.sum()),
            "maskCoverage": round(mask.sum() / (h * w) * 100, 1),
            "score": round(score, 3)
        }, request_id=request_id)
        
        # Конвертировать в bytes (0/255)
        mask_bytes = (mask.astype(np.uint8) * 255).tobytes()
        
        return mask_bytes, w, h, inference_time
    
    def handle_request(self, data: bytes) -> bytes:
        """Обработать запрос"""
        request_id = str(uuid.uuid4())[:8]
        
        try:
            request = json.loads(data.decode("utf-8"))
            request_id = request.get("requestId", request_id)
            
            log("Received request", data={
                "dataSize": len(data),
                "hasImage": "imageBase64" in request,
                "hasBbox": "bbox" in request
            }, request_id=request_id)
            
            # Декодировать изображение
            image_b64 = request.get("imageBase64")
            if not image_b64:
                raise ValueError("Missing imageBase64")
            
            image_data = base64.b64decode(image_b64)
            image = Image.open(BytesIO(image_data)).convert("RGB")
            
            # Получить bbox если передан
            bbox = request.get("bbox", None)
            
            # Сегментация
            mask_bytes, w, h, inference_time = self.segment(image, request_id, bbox=bbox)
            
            # Формировать ответ
            response = {
                "requestId": request_id,
                "maskWidth": w,
                "maskHeight": h,
                "maskBase64": base64.b64encode(mask_bytes).decode("utf-8"),
                "inferenceTimeMs": round(inference_time, 1)
            }
            
            return json.dumps(response).encode("utf-8")
            
        except Exception as e:
            log("Error processing request", data={
                "error": str(e),
                "traceback": traceback.format_exc()
            }, request_id=request_id)
            
            return json.dumps({
                "requestId": request_id,
                "error": str(e)
            }).encode("utf-8")


def read_exact(conn, n: int) -> bytes:
    """Читать ровно n байт из сокета"""
    data = b""
    while len(data) < n:
        chunk = conn.recv(n - len(data))
        if not chunk:
            raise ConnectionError("Connection closed")
        data += chunk
    return data


def main():
    log("========== SAM2 Service Starting ==========", data={
        "script_dir": str(SCRIPT_DIR),
        "python_version": sys.version,
        "torch_version": torch.__version__
    })
    
    # Проверить пути
    validate_paths()
    
    # Загрузить модель
    service = SAM2Service()
    service.load_model()
    
    # Удалить старый сокет
    try:
        os.unlink(SOCKET_PATH)
    except FileNotFoundError:
        pass
    
    # Создать Unix socket server
    server = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
    server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server.bind(SOCKET_PATH)
    server.listen(5)
    
    log("Server listening", data={"socket": SOCKET_PATH})
    print(f"\n[SAM2] Server ready on {SOCKET_PATH}\n", flush=True)
    
    while True:
        conn = None
        try:
            conn, _ = server.accept()
            
            # Читать length prefix (4 bytes, little-endian)
            length_data = read_exact(conn, 4)
            length = struct.unpack("<I", length_data)[0]
            
            if length > 100 * 1024 * 1024:  # Max 100MB
                log("Request too large", data={"length": length})
                continue
            
            # Читать payload
            data = read_exact(conn, length)
            
            # Обработать
            response = service.handle_request(data)
            
            # Отправить ответ
            conn.sendall(struct.pack("<I", len(response)))
            conn.sendall(response)
            
        except ConnectionError as e:
            log("Connection error", data={"error": str(e)})
        except Exception as e:
            log("Server error", data={
                "error": str(e),
                "traceback": traceback.format_exc()
            })
        finally:
            if conn:
                try:
                    conn.close()
                except:
                    pass


if __name__ == "__main__":
    main()
