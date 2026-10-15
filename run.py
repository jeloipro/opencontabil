import subprocess
import sys
import os
import socket
from pathlib import Path

# Configura encoding UTF-8 seguro para consoles Windows (cp1252)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

def main():
    print("=" * 65)
    print("   Azienda Contabil — Sistema Contabil Open Source")
    print("=" * 65)

    # 1. Verificar se o frontend foi compilado
    frontend_dist = ROOT_DIR / "frontend" / "dist"
    if not frontend_dist.exists():
        print("[1/2] Compilando frontend React...")
        subprocess.run(["npm", "run", "build"], cwd=ROOT_DIR / "frontend", shell=True, check=True)
    else:
        print("[1/2] Frontend estatico ja compilado em frontend/dist.")

    port = 8080 if is_port_in_use(8000) else 8000
    print(f"[2/2] Servidor disponivel em http://localhost:{port}...")
    backend_script = ROOT_DIR / "backend" / "run.py"
    subprocess.run([sys.executable, str(backend_script)])

if __name__ == "__main__":
    main()
