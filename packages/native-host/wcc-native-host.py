#!/usr/bin/env python3
"""
WCC Native Messaging Host
Проксирует сообщения из Chrome Extension в macOS Overlay App через Unix socket.

Формат Native Messaging: 4-byte length prefix (little-endian) + JSON bytes
"""

import sys
import json
import struct
import socket
import time
import os
from datetime import datetime

OVERLAY_SOCKET = '/tmp/wcc-overlay.sock'
LOG_DIR = os.path.expanduser('~/Library/Logs/WCCOverlay')
LOG_FILE = os.path.join(LOG_DIR, 'native-host.log')

# Создать директорию логов
os.makedirs(LOG_DIR, exist_ok=True)


def log(msg, data=None):
    """Структурированное логирование в stderr и файл"""
    ts = datetime.utcnow().isoformat() + 'Z'
    entry = {"ts": ts, "msg": msg}
    if data:
        entry["data"] = data
    line = json.dumps(entry)
    
    # stderr для отладки Chrome
    sys.stderr.write(line + "\n")
    sys.stderr.flush()
    
    # Файл для persistence
    try:
        with open(LOG_FILE, 'a') as f:
            f.write(line + "\n")
    except Exception as e:
        sys.stderr.write(f"Log file error: {e}\n")


def read_exact(n):
    """
    Читать ровно n байт из stdin (защита от partial reads).
    Критично для Native Messaging протокола.
    """
    data = b''
    while len(data) < n:
        remaining = n - len(data)
        chunk = sys.stdin.buffer.read(remaining)
        if not chunk:
            return None  # EOF
        data += chunk
    return data


def read_message():
    """Читать сообщение в формате Native Messaging (4-byte length prefix)"""
    # 1. Читаем length prefix (4 bytes, little-endian unsigned int)
    raw_length = read_exact(4)
    if not raw_length:
        return None
    
    length = struct.unpack('<I', raw_length)[0]
    log("Reading message", {"length": length})
    
    if length > 1024 * 1024:  # Sanity check: max 1MB
        log("Message too large", {"length": length})
        return None
    
    # 2. Читаем JSON payload
    raw_msg = read_exact(length)
    if not raw_msg:
        log("Failed to read message body")
        return None
    
    try:
        msg = json.loads(raw_msg.decode('utf-8'))
        log("Received message", {
            "type": msg.get("type"),
            "popupId": msg.get("popupId")
        })
        return msg
    except json.JSONDecodeError as e:
        log("JSON decode error", {"error": str(e), "raw": raw_msg[:100].decode('utf-8', errors='replace')})
        return None


def send_message(msg):
    """Отправить сообщение обратно в extension"""
    try:
        encoded = json.dumps(msg).encode('utf-8')
        sys.stdout.buffer.write(struct.pack('<I', len(encoded)))
        sys.stdout.buffer.write(encoded)
        sys.stdout.buffer.flush()
        log("Sent response to extension", {"status": msg.get("status")})
    except Exception as e:
        log("Failed to send response", {"error": str(e)})


def forward_to_overlay(msg, retry_count=3):
    """
    Переслать сообщение в macOS Overlay App через Unix socket.
    Использует retry с exponential backoff.
    """
    for attempt in range(retry_count):
        sock = None
        try:
            sock = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            sock.settimeout(2.0)
            sock.connect(OVERLAY_SOCKET)
            
            payload = json.dumps(msg).encode('utf-8')
            
            # Отправляем с length prefix (4 bytes, little-endian)
            sock.sendall(struct.pack('<I', len(payload)))
            sock.sendall(payload)
            
            log("Forwarded to overlay", {
                "type": msg.get("type"),
                "popupId": msg.get("popupId"),
                "attempt": attempt + 1
            })
            return True
            
        except socket.error as e:
            log("Socket error", {
                "error": str(e),
                "errno": getattr(e, 'errno', None),
                "attempt": attempt + 1
            })
            # Exponential backoff
            time.sleep(0.1 * (2 ** attempt))
            
        finally:
            if sock:
                try:
                    sock.close()
                except:
                    pass
    
    log("Failed to forward after retries", {
        "type": msg.get("type"),
        "retries": retry_count
    })
    return False


def main():
    log("Native host started", {
        "pid": os.getpid(),
        "socket": OVERLAY_SOCKET
    })
    
    while True:
        try:
            msg = read_message()
            if msg is None:
                log("EOF or read error, exiting")
                break
            
            success = forward_to_overlay(msg)
            
            # Ответ extension
            send_message({
                "status": "ok" if success else "error",
                "forwarded": success,
                "ts": int(time.time() * 1000)
            })
            
        except Exception as e:
            log("Unexpected error in main loop", {"error": str(e)})
            send_message({
                "status": "error",
                "error": str(e),
                "ts": int(time.time() * 1000)
            })
    
    log("Native host exiting")


if __name__ == '__main__':
    main()
