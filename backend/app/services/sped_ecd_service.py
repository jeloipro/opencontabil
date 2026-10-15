from datetime import date
from typing import List, Dict
from sqlalchemy.orm import Session
from app.models.models import Empresa, ContaContabil, Lancamento, Partida
from app.services.relatorios_service import RelatoriosService

class SpedEcdService:

    @staticmethod
    def gerar_arquivo_sped(db: Session, empresa_id: int, ano: int) -> str:
        empresa = db.query(Empresa).filter(Empresa.id == empresa_id).first()
        if not empresa:
            raise ValueError("Empresa não encontrada.")

        data_ini = date(ano, 1, 1)
        data_fim = date(ano, 12, 31)

        linhas: List[str] = []
        contagem_registros: Dict[str, int] = {}

        def add_reg(reg: str, *campos):
            linha = f"|{reg}|" + "|".join(str(c) for c in campos) + "|"
            linhas.append(linha)
            contagem_registros[reg] = contagem_registros.get(reg, 0) + 1

        cnpj_limpo = empresa.cnpj.replace(".", "").replace("/", "").replace("-", "")

        # --- BLOCO 0: Abertura e Identificação ---
        add_reg("0000", "LECD", data_ini.strftime("%d%m%Y"), data_fim.strftime("%d%m%Y"),
                empresa.razao_social, cnpj_limpo, empresa.uf, empresa.inscricao_estadual or "",
                "3550308", empresa.inscricao_municipal or "", "0", "0", "0", "", "", "N", "1", "0", "")
        add_reg("0001", "0")
        add_reg("0007", "00", "")

        # Fechamento Bloco 0
        bloco_0_count = sum(v for k, v in contagem_registros.items() if k.startswith("0")) + 1
        linhas.append(f"|0990|{bloco_0_count}|")
        contagem_registros["0990"] = 1

        # --- BLOCO I: Lançamentos e Plano de Contas ---
        add_reg("I001", "0")
        add_reg("I010", "G", "9.00")
        add_reg("I030", "TERMO DE ABERTURA", "1", "LIVRO DIARIO GERAL", empresa.razao_social,
                cnpj_limpo, "JUCESP", "123456789", "01012026", empresa.cidade, "01012026")

        # I050: Plano de Contas
        contas = db.query(ContaContabil).filter(
            ContaContabil.empresa_id == empresa_id,
            ContaContabil.ativa == True
        ).order_by(ContaContabil.codigo).all()

        for c in contas:
            ind_cta = "S" if c.tipo == "SINTETICA" else "A"
            natureza_sped = {
                "ATIVO": "01",
                "PASSIVO": "02",
                "PATRIMONIO_LIQUIDO": "03",
                "RECEITAS": "04",
                "DESPESAS": "04",
                "CUSTOS": "04"
            }.get(c.grupo, "09")

            add_reg("I050", data_ini.strftime("%d%m%Y"), natureza_sped, ind_cta, c.nivel,
                    c.codigo, c.codigo[:c.codigo.rfind(".")] if "." in c.codigo else "", c.descricao)

            if c.codigo_referencial_rfb and c.tipo == "ANALITICA":
                add_reg("I051", "10", c.codigo_referencial_rfb)

        # I200 / I250: Lançamentos Contábeis
        lancamentos = db.query(Lancamento).filter(
            Lancamento.empresa_id == empresa_id,
            Lancamento.data >= data_ini,
            Lancamento.data <= data_fim
        ).order_by(Lancamento.data, Lancamento.numero).all()

        for l in lancamentos:
            total_val = sum(p.valor for p in l.partidas if p.tipo == "DEBITO")
            add_reg("I200", str(l.numero), l.data.strftime("%d%m%Y"), f"{total_val:.2f}".replace(".", ","), "N")

            for p in l.partidas:
                tp_partida = "D" if p.tipo == "DEBITO" else "C"
                add_reg("I250", p.conta.codigo, "", f"{p.valor:.2f}".replace(".", ","),
                        tp_partida, "", "", l.historico + (f" - {p.complemento}" if p.complemento else ""), "")

        # Fechamento Bloco I
        bloco_i_count = sum(v for k, v in contagem_registros.items() if k.startswith("I")) + 1
        linhas.append(f"|I990|{bloco_i_count}|")
        contagem_registros["I990"] = 1

        # --- BLOCO J: Demonstrações Contábeis ---
        add_reg("J001", "0")
        add_reg("J005", data_ini.strftime("%d%m%Y"), data_fim.strftime("%d%m%Y"), "1", "BALANÇO PATRIMONIAL E DRE")

        # J100: Balanço
        bp = RelatoriosService.gerar_balanco_patrimonial(db, empresa_id, data_fim)
        for linha in bp.ativo:
            ind_val = "D"
            add_reg("J100", linha.codigo, linha.nivel, linha.descricao, f"{abs(linha.valor):.2f}".replace(".", ","), ind_val)

        for linha in bp.passivo_pl:
            ind_val = "C"
            add_reg("J100", linha.codigo, linha.nivel, linha.descricao, f"{abs(linha.valor):.2f}".replace(".", ","), ind_val)

        # J150: DRE
        dre = RelatoriosService.gerar_dre(db, empresa_id, data_ini, data_fim)
        for linha in dre.linhas:
            ind_vl = "D" if linha.valor < 0 else "C"
            add_reg("J150", linha.codigo, linha.nivel, linha.descricao, f"{abs(linha.valor):.2f}".replace(".", ","), ind_vl)

        add_reg("J900", "TERMO DE ENCERRAMENTO", "1", "LIVRO DIARIO GERAL", empresa.razao_social,
                cnpj_limpo, "JUCESP", "123456789", "01012026", data_fim.strftime("%d%m%Y"), data_fim.strftime("%d%m%Y"))
        add_reg("J930", "THOR CONTADOR AUDITOR", "00000000000", "CONTADOR", "900", "CRC-SP 123456/O", "contador@opencontabil.org", "11999998888", "SP", "")
        add_reg("J930", empresa.razao_social, cnpj_limpo, "DIRETOR / ADMINISTRADOR", "206", "", "diretoria@empresa.com.br", "", "SP", "")

        bloco_j_count = sum(v for k, v in contagem_registros.items() if k.startswith("J")) + 1
        linhas.append(f"|J990|{bloco_j_count}|")
        contagem_registros["J990"] = 1

        # --- BLOCO 9: Encerramento do Arquivo ---
        add_reg("9001", "0")
        contagem_registros["9900"] = len(contagem_registros) + 3
        for reg_k, reg_v in sorted(contagem_registros.items()):
            linhas.append(f"|9900|{reg_k}|{reg_v}|")

        linhas.append(f"|9900|9900|{len(contagem_registros) + 3}|")
        linhas.append(f"|9900|9990|1|")
        linhas.append(f"|9900|9999|1|")

        linhas.append(f"|9990|{len(contagem_registros) + 5}|")
        total_geral = len(linhas) + 1
        linhas.append(f"|9999|{total_geral}|")

        return "\r\n".join(linhas)

    @staticmethod
    def validar_consistencia(db: Session, empresa_id: int, ano: int) -> Dict[str, Any]:
        """
        Pré-validador embutido que verifica erros que causariam rejeição no PVA da RFB.
        """
        avisos = []
        erros = []

        # 1. Checar contas analíticas sem código referencial RFB
        contas_sem_ref = db.query(ContaContabil).filter(
            ContaContabil.empresa_id == empresa_id,
            ContaContabil.tipo == "ANALITICA",
            ContaContabil.ativa == True,
            (ContaContabil.codigo_referencial_rfb == None) | (ContaContabil.codigo_referencial_rfb == "")
        ).all()

        for c in contas_sem_ref:
            avisos.append(f"Conta analítica {c.codigo} ({c.descricao}) não possui mapeamento no Plano Referencial da RFB.")

        # 2. Checar integridade de partidas dobradas
        lancamentos = db.query(Lancamento).filter(
            Lancamento.empresa_id == empresa_id
        ).all()

        for l in lancamentos:
            deb = sum(p.valor for p in l.partidas if p.tipo == "DEBITO")
            cred = sum(p.valor for p in l.partidas if p.tipo == "CREDITO")
            if abs(deb - cred) > 0.009:
                erros.append(f"Lançamento Nº {l.numero} (Data: {l.data}) possui diferença de partidas: Débito={deb:.2f} != Crédito={cred:.2f}")

        # 3. Checar fechamento de balanço
        bp = RelatoriosService.gerar_balanco_patrimonial(db, empresa_id, date(ano, 12, 31))
        if not bp.balanceado:
            erros.append(f"Balanço Patrimonial não fecha: Ativo Total (R$ {bp.total_ativo:.2f}) != Passivo + PL Total (R$ {bp.total_passivo_pl:.2f})")

        return {
            "aprovado_para_transmissao": len(erros) == 0,
            "total_erros": len(erros),
            "total_avisos": len(avisos),
            "erros": erros,
            "avisos": avisos
        }
