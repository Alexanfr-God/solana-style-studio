# SAM2 Segmentation Service

Local segmentation service using official [facebookresearch/sam2](https://github.com/facebookresearch/sam2).

## Prerequisites

- Python 3.10+
- PyTorch 2.5.1+ with CUDA or MPS support
- ~4GB RAM for tiny model

## Installation

```bash
cd packages/sam2-service

# 1. Clone official SAM2 repo as vendor
git clone https://github.com/facebookresearch/sam2.git vendor/sam2

# 2. Install SAM2
cd vendor/sam2
pip install -e .
cd ../..

# 3. Install dependencies
pip install -r requirements.txt

# 4. Download checkpoint (~40MB for tiny model)
chmod +x download_checkpoint.sh
./download_checkpoint.sh

# 5. Run server
python sam2_server.py
```

## API

Unix socket: `/tmp/wcc-sam2.sock`

### Request (JSON)

```json
{
  "requestId": "abc12345",
  "width": 400,
  "height": 600,
  "imageBase64": "<base64 PNG/JPEG>",
  "bbox": {
    "x1": 10,
    "y1": 10,
    "x2": 390,
    "y2": 590
  }
}
```

### Response (JSON)

```json
{
  "requestId": "abc12345",
  "maskWidth": 400,
  "maskHeight": 600,
  "maskBase64": "<base64 binary mask>",
  "inferenceTimeMs": 45.2
}
```

### Error Response

```json
{
  "requestId": "abc12345",
  "error": "Error message"
}
```

## Mask Format

- Binary mask: 0 = background, 255 = foreground
- Size: width × height bytes
- Row-major order (left to right, top to bottom)

## Performance

| Model | Size | Params | Inference (M1) | Inference (RTX 3090) |
|-------|------|--------|----------------|----------------------|
| tiny | 40MB | 38.9M | ~150ms | ~30ms |
| small | 80MB | 46M | ~200ms | ~40ms |
| base+ | 160MB | 80.8M | ~350ms | ~60ms |
| large | 900MB | 224.4M | ~800ms | ~100ms |

## Logs

```bash
tail -f ~/Library/Logs/WCCOverlay/sam2-service.log
```

## Troubleshooting

### "SAM2 not found"
```bash
git clone https://github.com/facebookresearch/sam2.git vendor/sam2
cd vendor/sam2 && pip install -e .
```

### "Checkpoint not found"
```bash
./download_checkpoint.sh
```

### "CUDA out of memory"
Use smaller model or reduce image resolution.

### "MPS not available"
Update to macOS 12.3+ and PyTorch 2.0+.
