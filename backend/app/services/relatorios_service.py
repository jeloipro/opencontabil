from datetime import date
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.models import ContaContabil, Lancamento, Partida, Empresa
from app.schemas.schemas import (
    BalanceteResponse, LinhaBalancete,
    BalancoPatrimonialResponse, DREResponse, LinhaDemonstracao
)

class RelatoriosService:

    @staticmethod
    def gerar_balancete(db: Session, empresa_id: int, data_inicio: date, data_fim: date) -> BalanceteResponse:
        contas = db.query(ContaContabil).filter(
            ContaContabil.empresa_id == empresa_id,
            ContaContabil.ativa == True
        ).order_by(ContaContabil.codigo).all()

        linhas: List[LinhaBalancete] = []
        total_periodo_debito = 0.0
        total_periodo_credito = 0.0

        # Para cada conta calculamos movimentação anterior e no período
        for c in contas:
            # Saldo Anterior (antes de data_inicio)
            deb_ant = db.query(func.coalesce(func.sum(Partida.valor), 0.0)).join(Lancamento).filter(
                Lancamento.empresa_id == empresa_id,
                Lancamento.data < data_inicio,
                Partida.conta_id == c.id,
                Partida.tipo == "DEBITO"
            ).scalar()

            cred_ant = db.query(func.coalesce(func.sum(Partida.valor), 0.0)).join(Lancamento).filter(
                Lancamento.empresa_id == empresa_id,
                Lancamento.data < data_inicio,
                Partida.conta_id == c.id,
                Partida.tipo == "CREDITO"
            ).scalar()

            # Movimentação no Período [data_inicio, data_fim]
            deb_per = db.query(func.coalesce(func.sum(Partida.valor), 0.0)).join(Lancamento).filter(
                Lancamento.empresa_id == empresa_id,
                Lancamento.data >= data_inicio,
                Lancamento.data <= data_fim,
                Partida.conta_id == c.id,
                Partida.tipo == "DEBITO"
            ).scalar()

            cred_per = db.query(func.coalesce(func.sum(Partida.valor), 0.0)).join(Lancamento).filter(
                Lancamento.empresa_id == empresa_id,
                Lancamento.data >= data_inicio,
                Lancamento.data <= data_fim,
                Partida.conta_id == c.id,
                Partida.tipo == "CREDITO"
            ).scalar()

            # Cálculo de acordo com a natureza
            if c.natureza == "DEVEDORA":
                saldo_ant = deb_ant - cred_ant
                saldo_atu = saldo_ant + deb_per - cred_per
            else:
                saldo_ant = cred_ant - deb_ant
                saldo_atu = saldo_ant + cred_per - deb_per

            if c.tipo == "ANALITICA":
                total_periodo_debito += deb_per
                total_periodo_credito += cred_per

            linhas.append(LinhaBalancete(
                conta_id=c.id,
                codigo=c.codigo,
                codigo_reduzido=c.codigo_reduzido,
                descricao=c.descricao,
                tipo=c.tipo,
                natureza=c.natureza,
                saldo_anterior=round(saldo_ant, 2),
                movimento_debito=round(deb_per, 2),
                movimento_credito=round(cred_per, 2),
                saldo_atual=round(saldo_atu, 2)
            ))

        # Propagar saldos para contas sintéticas pai
        # Organizado do maior nível para o menor
        for nivel in range(5, 0, -1):
            for linha in linhas:
                if linha.tipo == "SINTETICA":
                    # Somar todas as filhas diretas que começam com o código da sintética
                    prefixo = linha.codigo + "."
                    filhas_analiticas = [
                        l for l in linhas
                        if l.codigo.startswith(prefixo) and l.tipo == "ANALITICA"
                    ]
                    if filhas_analiticas:
                        linha.saldo_anterior = round(sum(f.saldo_anterior for f in filhas_analiticas), 2)
                        linha.movimento_debito = round(sum(f.movimento_debito for f in filhas_analiticas), 2)
                        linha.movimento_credito = round(sum(f.movimento_credito for f in filhas_analiticas), 2)
                        linha.saldo_atual = round(sum(f.saldo_atual for f in filhas_analiticas), 2)

        return BalanceteResponse(
            empresa_id=empresa_id,
            data_inicio=data_inicio,
            data_fim=data_fim,
            total_debito=round(total_periodo_debito, 2),
            total_credito=round(total_periodo_credito, 2),
            linhas=linhas
        )

    @staticmethod
    def gerar_dre(db: Session, empresa_id: int, data_inicio: date, data_fim: date) -> DREResponse:
        # Busca todas as contas de receitas, custos e despesas
        balancete = RelatoriosService.gerar_balancete(db, empresa_id, data_inicio, data_fim)
        mapa_contas = {l.codigo: l for l in balancete.linhas}

        # Extrair valores dos grupos
        def get_val(cod_prefix: str) -> float:
            tot = 0.0
            for l in balancete.linhas:
                if l.tipo == "ANALITICA" and l.codigo.startswith(cod_prefix):
                    tot += l.saldo_atual
            return tot

        rec_bruta = get_val("5.1")
        rec_financeira = get_val("5.2")
        custos = get_val("4.1")
        desp_adm = get_val("4.2.01")
        desp_pessoal = get_val("4.2.02")
        desp_financeira = get_val("4.2.03")
        desp_tributaria = get_val("4.2.04")

        rec_liquida = rec_bruta
        lucro_bruto = rec_liquida - custos
        total_desp_operacionais = desp_adm + desp_pessoal + desp_tributaria
        resultado_financeiro = rec_financeira - desp_financeira
        lucro_liquido = lucro_bruto - total_desp_operacionais + resultado_financeiro

        linhas_dre: List[LinhaDemonstracao] = [
            LinhaDemonstracao(codigo="1", descricao="(=) RECEITA OPERACIONAL BRUTA", valor=round(rec_bruta, 2), nivel=1, destaque=True),
            LinhaDemonstracao(codigo="1.1", descricao="    Receita de Serviços / Vendas", valor=round(rec_bruta, 2), nivel=2),
            LinhaDemonstracao(codigo="2", descricao="(=) RECEITA OPERACIONAL LÍQUIDA", valor=round(rec_liquida, 2), nivel=1, destaque=True),
            LinhaDemonstracao(codigo="3", descricao="(-) CUSTOS DOS SERVIÇOS E MERCADORIAS (CMV/CSP)", valor=round(-custos, 2), nivel=1),
            LinhaDemonstracao(codigo="4", descricao="(=) LUCRO BRUTO OPERACIONAL", valor=round(lucro_bruto, 2), nivel=1, destaque=True),
            LinhaDemonstracao(codigo="5", descricao="(-) DESPESAS OPERACIONAIS", valor=round(-total_desp_operacionais, 2), nivel=1, destaque=True),
            LinhaDemonstracao(codigo="5.1", descricao="    Despesas Administrativas e Gerais", valor=round(-desp_adm, 2), nivel=2),
            LinhaDemonstracao(codigo="5.2", descricao="    Despesas com Pessoal e Encargos", valor=round(-desp_pessoal, 2), nivel=2),
            LinhaDemonstracao(codigo="5.3", descricao="    Despesas Tributárias e Impostos", valor=round(-desp_tributaria, 2), nivel=2),
            LinhaDemonstracao(codigo="6", descricao="(+/-) RESULTADO FINANCEIRO LÍQUIDO", valor=round(resultado_financeiro, 2), nivel=1),
            LinhaDemonstracao(codigo="6.1", descricao="    Receitas Financeiras / Rendimentos", valor=round(rec_financeira, 2), nivel=2),
            LinhaDemonstracao(codigo="6.2", descricao="    Despesas Financeiras / Tarifas", valor=round(-desp_financeira, 2), nivel=2),
            LinhaDemonstracao(codigo="7", descricao="(=) RESULTADO LÍQUIDO DO EXERCÍCIO (LUCRO / PREJUÍZO)", valor=round(lucro_liquido, 2), nivel=1, destaque=True)
        ]

        return DREResponse(
            empresa_id=empresa_id,
            data_inicio=data_inicio,
            data_fim=data_fim,
            linhas=linhas_dre,
            lucro_prejuizo_liquido=round(lucro_liquido, 2)
        )

    @staticmethod
    def gerar_balanco_patrimonial(db: Session, empresa_id: int, data_posicao: date) -> BalancoPatrimonialResponse:
        data_ini = date(data_posicao.year, 1, 1)
        balancete = RelatoriosService.gerar_balancete(db, empresa_id, data_ini, data_posicao)
        dre = RelatoriosService.gerar_dre(db, empresa_id, data_ini, data_posicao)

        linhas_ativo: List[LinhaDemonstracao] = []
        linhas_passivo: List[LinhaDemonstracao] = []

        total_ativo = 0.0
        total_passivo_pl = 0.0

        for l in balancete.linhas:
            if l.codigo.startswith("1"):
                linhas_ativo.append(LinhaDemonstracao(
                    codigo=l.codigo,
                    descricao=l.descricao,
                    valor=l.saldo_atual,
                    nivel=len(l.codigo.split(".")),
                    destaque=(l.tipo == "SINTETICA")
                ))
                if l.tipo == "ANALITICA":
                    total_ativo += l.saldo_atual

            elif l.codigo.startswith("2") or l.codigo.startswith("3"):
                linhas_passivo.append(LinhaDemonstracao(
                    codigo=l.codigo,
                    descricao=l.descricao,
                    valor=l.saldo_atual,
                    nivel=len(l.codigo.split(".")),
                    destaque=(l.tipo == "SINTETICA")
                ))
                if l.tipo == "ANALITICA":
                    total_passivo_pl += l.saldo_atual

        # Adicionar o Lucro/Prejuízo apurado no período ao Patrimônio Líquido
        lucro_periodo = dre.lucro_prejuizo_liquido
        linhas_passivo.append(LinhaDemonstracao(
            codigo="3.2.01.999",
            descricao="Resultado Apurado no Período Corrente (DRE)",
            valor=round(lucro_periodo, 2),
            nivel=4,
            destaque=True
        ))
        total_passivo_pl += lucro_periodo

        balanceado = abs(round(total_ativo, 2) - round(total_passivo_pl, 2)) < 0.01

        return BalancoPatrimonialResponse(
            empresa_id=empresa_id,
            data_posicao=data_posicao,
            ativo=linhas_ativo,
            passivo_pl=linhas_passivo,
            total_ativo=round(total_ativo, 2),
            total_passivo_pl=round(total_passivo_pl, 2),
            balanceado=balanceado
        )

    @staticmethod
    def gerar_indicadores(db: Session, empresa_id: int, data_posicao: date) -> Dict[str, Any]:
        bp = RelatoriosService.gerar_balanco_patrimonial(db, empresa_id, data_posicao)
        data_ini = date(data_posicao.year, 1, 1)
        dre = RelatoriosService.gerar_dre(db, empresa_id, data_ini, data_posicao)

        # Extração de grupos
        ativo_circulante = sum(l.valor for l in bp.ativo if l.codigo == "1.1")
        estoques = sum(l.valor for l in bp.ativo if l.codigo == "1.1.03")
        passivo_circulante = sum(l.valor for l in bp.passivo_pl if l.codigo == "2.1")
        total_passivo = sum(l.valor for l in bp.passivo_pl if l.codigo in ["2.1", "2.2"])
        total_ativo = bp.total_ativo
        lucro_liquido = dre.lucro_prejuizo_liquido
        receita_liquida = sum(l.valor for l in dre.linhas if l.codigo == "2")

        liquidez_corrente = round(ativo_circulante / passivo_circulante, 2) if passivo_circulante > 0 else 999.0
        liquidez_seca = round((ativo_circulante - estoques) / passivo_circulante, 2) if passivo_circulante > 0 else 999.0
        endividamento_geral = round((total_passivo / total_ativo) * 100, 2) if total_ativo > 0 else 0.0
        margem_liquida = round((lucro_liquido / receita_liquida) * 100, 2) if receita_liquida > 0 else 0.0

        return {
            "liquidez_corrente": liquidez_corrente,
            "liquidez_seca": liquidez_seca,
            "endividamento_geral_pct": endividamento_geral,
            "margem_liquida_pct": margem_liquida,
            "lucro_liquido": lucro_liquido,
            "faturamento_acumulado": receita_liquida,
            "total_ativo": bp.total_ativo,
            "total_passivo_pl": bp.total_passivo_pl,
            "balanceado": bp.balanceado
        }
