from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "ok"

def test_get_empresas():
    res = client.get("/api/v1/empresas/")
    assert res.status_code == 200
    empresas = res.json()
    assert len(empresas) > 0

def test_dashboard():
    res = client.get("/api/v1/dashboard/1")
    assert res.status_code == 200
    data = res.json()
    assert "resumo" in data
    assert "indicadores" in data
    assert data["resumo"]["balanceado"] is True

def test_balancete():
    res = client.get("/api/v1/relatorios/balancete/1")
    assert res.status_code == 200
    data = res.json()
    assert data["total_debito"] > 0
    assert len(data["linhas"]) > 0

def test_balanco_patrimonial():
    res = client.get("/api/v1/relatorios/balanco-patrimonial/1")
    assert res.status_code == 200
    data = res.json()
    assert data["balanceado"] is True

def test_dre():
    res = client.get("/api/v1/relatorios/dre/1")
    assert res.status_code == 200
    data = res.json()
    assert len(data["linhas"]) > 0

def test_sped_ecd_export():
    res = client.get("/api/v1/fiscal-sped/exportar-ecd/1?ano=2026")
    assert res.status_code == 200
    assert "|0000|LECD|" in res.text
    assert "|9999|" in res.text

def test_simular_reforma():
    res = client.post("/api/v1/fiscal-sped/simular-reforma", json={
        "faturamento_mensal": 100000,
        "compras_insumos_mensal": 30000,
        "folha_salarios_mensal": 20000,
        "regime_atual": "LUCRO_PRESUMIDO",
        "aliquota_cbs": 8.8,
        "aliquota_ibs": 17.7,
        "aliquota_is": 0.0
    })
    assert res.status_code == 200
    assert "tributacao_atual" in res.json()
    assert "tributacao_nova_reforma" in res.json()

