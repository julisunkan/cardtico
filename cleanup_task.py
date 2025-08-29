import os
import threading
import time

def cleanup_file(filepath):
    """Remove file after delay"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            print(f"Cleaned up file: {filepath}")
    except Exception as e:
        print(f"Error cleaning up file {filepath}: {e}")

def schedule_cleanup(filepath, delay=60):
    """Schedule file cleanup after delay"""
    timer = threading.Timer(delay, cleanup_file, args=[filepath])
    timer.start()
    return timer
