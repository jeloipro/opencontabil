import subprocess
import sys
import os
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent

def main():
    print("=" * 60)
    print("   OpenContabil Phoenix — Sistema Contábil Open Source")
    print("=" * 60)

    # 1. Verificar se o frontend foi compilado
    frontend_dist = ROOT_DIR / "frontend" / "dist"
    if not frontend_dist.exists():
        print("[1/2] Compilando frontend React...")
        subprocess.run(["npm", "run", "build"], cwd=ROOT_DIR / "frontend", shell=True, check=True)
    else:
        print("[1/2] Frontend estático já compilado em frontend/dist.")

    # 2. Iniciar servidor FastAPI
    print("[2/2] Iniciando Servidor Web em http://localhost:8000...")
    backend_script = ROOT_DIR / "backend" / "run.py"
    subprocess.run([sys.executable, str(backend_script)])

if __name__ == "__main__":
    main()
