"""
Skylent Global — Python Programming & Automation Starter Suite
Course: Python Programming & Automation (python-programming)
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any, Generator
import json
import os
import sys
import time

@dataclass(frozen=True)
class LogEvent:
    timestamp: datetime
    method: str
    path: str
    status_code: int
    latency_ms: float

def parse_log_line(line: str) -> LogEvent | None:
    parts = line.strip().split()
    if len(parts) < 5:
        return None
    try:
        ts = datetime.fromisoformat(parts[0].replace("Z", "+00:00"))
        method = parts[1].strip("[]")
        path = parts[2]
        status = int(parts[3].split("=")[-1])
        latency = float(parts[4].split("=")[-1].replace("ms", ""))
        return LogEvent(timestamp=ts, method=method, path=path, status_code=status, latency_ms=latency)
    except (ValueError, IndexError):
        return None

def stream_log_file(filepath: str) -> Generator[LogEvent, None, None]:
    if not os.path.exists(filepath):
        return
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            event = parse_log_line(line)
            if event is not None:
                yield event

if __name__ == "__main__":
    print("Skylent Python Starter Suite loaded successfully.")
