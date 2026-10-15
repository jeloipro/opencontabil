import pytest
from datetime import date
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.database import Base
from app.models.models import Empresa, ContaContabil, Lancamento, Partida, TransacaoOFX
from app.services.seed_service import seed_database
from app.services.contabilidade_service import ContabilidadeService
from app.services.relatorios_service import RelatoriosService
from app.services.sped_ecd_service import SpedEcdService
from app.services.ofx_parser_service import OFXParserService
from app.services.reforma_tributaria_service import ReformaTributariaService
from app.schemas.schemas import LancamentoCreate, PartidaCreate, SimuladorReformaRequest

@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()
    seed_database(db)
    yield db
    db.close()

def test_seed_creates_company_and_accounts(test_db):
    empresa = test_db.query(Empresa).first()
    assert empresa is not None
    assert "PHOENIX" in empresa.razao_social

    contas = test_db.query(ContaContabil).filter(ContaContabil.empresa_id == empresa.id).all()
    assert len(contas) > 30

    # Checar se existem contas analíticas e sintéticas
    analiticas = [c for c in contas if c.tipo == "ANALITICA"]
    sinteticas = [c for c in contas if c.tipo == "SINTETICA"]
    assert len(analiticas) > 10
    assert len(sinteticas) > 10

def test_criar_lancamento_balanceado(test_db):
    empresa = test_db.query(Empresa).first()
    banco = test_db.query(ContaContabil).filter(ContaContabil.codigo_reduzido == 20).first()
    receita = test_db.query(ContaContabil).filter(ContaContabil.codigo_reduzido == 410).first()

    payload = LancamentoCreate(
        data=date(2026, 2, 1),
        tipo="ORDINARIO",
        historico="Recebimento de honorários de consultoria",
        documento="NF-800",
        partidas=[
            PartidaCreate(conta_id=banco.id, tipo="DEBITO", valor=5000.0),
            PartidaCreate(conta_id=receita.id, tipo="CREDITO", valor=5000.0)
        ]
    )

    lancamento = ContabilidadeService.criar_lancamento(test_db, empresa.id, payload)
    assert lancamento.id is not None
    assert lancamento.numero > 0
    assert len(lancamento.partidas) == 2

def test_rejeitar_lancamento_desbalanceado():
    # Pydantic deve rejeitar débitos != créditos
    with pytest.raises(ValueError, match="As partidas não fecham"):
        LancamentoCreate(
            data=date(2026, 2, 1),
            tipo="ORDINARIO",
            historico="Lançamento com erro proposital",
            partidas=[
                PartidaCreate(conta_id=1, tipo="DEBITO", valor=100.0),
                PartidaCreate(conta_id=2, tipo="CREDITO", valor=90.0)
            ]
        )

def test_gerar_balancete_e_dre(test_db):
    empresa = test_db.query(Empresa).first()
    balancete = RelatoriosService.gerar_balancete(
        test_db, empresa.id, date(2026, 1, 1), date(2026, 12, 31)
    )
    assert balancete.total_debito > 0
    assert balancete.total_credito > 0
    assert abs(balancete.total_debito - balancete.total_credito) < 0.01

    dre = RelatoriosService.gerar_dre(
        test_db, empresa.id, date(2026, 1, 1), date(2026, 12, 31)
    )
    assert dre.lucro_prejuizo_liquido > 0

    bp = RelatoriosService.gerar_balanco_patrimonial(test_db, empresa.id, date(2026, 12, 31))
    assert bp.balanceado is True

def test_gerar_sped_ecd(test_db):
    empresa = test_db.query(Empresa).first()
    txt = SpedEcdService.gerar_arquivo_sped(test_db, empresa.id, 2026)
    assert "|0000|LECD|" in txt
    assert "|I010|G|9.00|" in txt
    assert "|I050|" in txt
    assert "|I200|" in txt
    assert "|J100|" in txt
    assert "|J150|" in txt
    assert "|9999|" in txt

def test_parser_ofx():
    ofx_sample = """
    <OFX>
      <BANKMSGSRSV1>
        <STMTTRNRS>
          <STMTRS>
            <BANKTRANLIST>
              <STMTTRN>
                <TRNTYPE>DEBIT
                <DTPOSTED>20260215120000[-03:EST]
                <TRNAMT>-150.00
                <FITID>20260215001
                <MEMO>TARIFA BANCARIA CESTA BASICA
              </STMTTRN>
              <STMTTRN>
                <TRNTYPE>CREDIT
                <DTPOSTED>20260216120000[-03:EST]
                <TRNAMT>2500.00
                <FITID>20260216002
                <MEMO>PIX RECEBIDO CLIENTE XYZ
              </STMTTRN>
            </BANKTRANLIST>
          </STMTRS>
        </STMTTRNRS>
      </BANKMSGSRSV1>
    </OFX>
    """
    transacoes = OFXParserService.parse_ofx(ofx_sample)
    assert len(transacoes) == 2
    assert transacoes[0]["fitid"] == "20260215001"
    assert transacoes[0]["valor"] == 150.0
    assert transacoes[1]["valor"] == 2500.0

def test_reforma_tributaria_simulacao():
    req = SimuladorReformaRequest(
        faturamento_mensal=100000.0,
        compras_insumos_mensal=30000.0,
        folha_salarios_mensal=25000.0,
        regime_atual="LUCRO_PRESUMIDO",
        aliquota_cbs=8.8,
        aliquota_ibs=17.7
    )
    res = ReformaTributariaService.simular(req)
    assert res.tributacao_atual["total_mensal"] > 0
    assert res.tributacao_nova_reforma["total_mensal"] > 0
    assert res.credito_cbs_ibs_mensal > 0

