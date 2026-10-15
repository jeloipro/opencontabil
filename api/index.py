import sys
import os
from pathlib import Path

# Adiciona o diretório backend ao sys.path para o runtime serverless do Vercel
backend_path = Path(__file__).resolve().parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app
