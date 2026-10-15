import uvicorn
import os
import sys
import socket

# Configura encoding UTF-8 seguro para consoles Windows (cp1252)
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Adiciona o diretório backend ao path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) == 0

if __name__ == "__main__":
    port_env = os.environ.get("PORT")
    if port_env:
        port = int(port_env)
    else:
        # Se a porta 8000 estiver ocupada (ex: por wslrelay), usa 8080
        port = 8080 if is_port_in_use(8000) else 8000

    print("=" * 65)
    print("   Azienda Contábil rodando em:")
    print(f"   -> http://localhost:{port}")
    print(f"   -> Swagger Docs: http://localhost:{port}/docs")
    print("=" * 65)
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=False)
