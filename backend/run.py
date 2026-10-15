import uvicorn
import os
import sys

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Iniciando OpenContabil Phoenix Backend na porta 8000...")
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
