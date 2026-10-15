import re
from datetime import datetime, date
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.models import TransacaoOFX, RegraConciliacao, Lancamento, Partida, ContaContabil

class OFXParserService:

    @staticmethod
    def parse_ofx(content: str) -> List[Dict[str, Any]]:
        """
        Parser universal para extratos bancários OFX (SGML e XML).
        Extrai DTPOSTED, TRNTYPE, TRNAMT, FITID e MEMO.
        """
        transacoes = []
        # Normalização de quebras de linha
        content = content.replace("\r\n", "\n").replace("\r", "\n")

        # Procura blocos <STMTTRN> ... </STMTTRN> ou SGML <STMTTRN> até próximo <STMTTRN> ou </BANKTRANLIST>
        trn_blocks = re.findall(r'<STMTTRN>(.*?)(?=(?:<STMTTRN>|</BANKTRANLIST>|\Z))', content, re.DOTALL | re.IGNORECASE)

        for block in trn_blocks:
            trntype = re.search(r'<TRNTYPE>([^<\n\r]+)', block, re.IGNORECASE)
            dtposted = re.search(r'<DTPOSTED>([^<\n\r]+)', block, re.IGNORECASE)
            trnamt = re.search(r'<TRNAMT>([^<\n\r]+)', block, re.IGNORECASE)
            fitid = re.search(r'<FITID>([^<\n\r]+)', block, re.IGNORECASE)
            memo = re.search(r'<MEMO>([^<\n\r]+)', block, re.IGNORECASE)

            if dtposted and trnamt and fitid:
                raw_date = dtposted.group(1).strip()[:8] # YYYYMMDD
                try:
                    trn_date = datetime.strptime(raw_date, "%Y%m%d").date()
                except ValueError:
                    trn_date = date.today()

                raw_amt = trnamt.group(1).strip().replace(",", ".")
                try:
                    val = float(raw_amt)
                except ValueError:
                    val = 0.0

                transacoes.append({
                    "fitid": fitid.group(1).strip(),
                    "tipo": trntype.group(1).strip().upper() if trntype else ("CREDIT" if val > 0 else "DEBIT"),
                    "data": trn_date,
                    "valor": abs(val),
                    "sinal": 1 if val >= 0 else -1,
                    "memo": memo.group(1).strip() if memo else "Transação Bancária"
                })

        return transacoes

    @staticmethod
    def importar_e_processar(db: Session, empresa_id: int, conta_bancaria_id: int, ofx_content: str) -> Dict[str, Any]:
        parsed = OFXParserService.parse_ofx(ofx_content)
        regras = db.query(RegraConciliacao).filter(
            RegraConciliacao.empresa_id == empresa_id,
            RegraConciliacao.ativa == True
        ).all()

        importadas = 0
        duplicadas = 0
        auto_conciliadas = 0

        for item in parsed:
            # Checar duplicidade por FITID
            existe = db.query(TransacaoOFX).filter(
                TransacaoOFX.empresa_id == empresa_id,
                TransacaoOFX.fitid == item["fitid"]
            ).first()

            if existe:
                duplicadas += 1
                continue

            trn = TransacaoOFX(
                empresa_id=empresa_id,
                conta_bancaria_id=conta_bancaria_id,
                fitid=item["fitid"],
                data=item["data"],
                tipo="CREDIT" if item["sinal"] > 0 else "DEBIT",
                valor=item["valor"],
                memo=item["memo"],
                status="PENDENTE"
            )
            db.add(trn)
            db.flush()
            importadas += 1

            # Tenta aplicar regra de auto-conciliação
            memo_upper = item["memo"].upper()
            for regra in regras:
                if regra.padrao_texto.upper() in memo_upper:
                    # Gera lançamento contábil automático
                    # Se valor positivo (CREDIT): Débito no Banco, Crédito na Contrapartida
                    # Se valor negativo (DEBIT): Débito na Contrapartida, Crédito no Banco
                    from app.services.contabilidade_service import ContabilidadeService
                    from app.schemas.schemas import LancamentoCreate, PartidaCreate

                    if item["sinal"] > 0:
                        partidas = [
                            PartidaCreate(conta_id=conta_bancaria_id, tipo="DEBITO", valor=item["valor"]),
                            PartidaCreate(conta_id=regra.conta_contrapartida_id, tipo="CREDITO", valor=item["valor"], centro_custo_id=regra.centro_custo_id)
                        ]
                    else:
                        partidas = [
                            PartidaCreate(conta_id=regra.conta_contrapartida_id, tipo="DEBITO", valor=item["valor"], centro_custo_id=regra.centro_custo_id),
                            PartidaCreate(conta_id=conta_bancaria_id, tipo="CREDITO", valor=item["valor"])
                        ]

                    l_create = LancamentoCreate(
                        data=item["data"],
                        tipo="ORDINARIO",
                        historico=f"{regra.historico_padrao} - Ref: {item['memo']}",
                        documento=f"OFX-{item['fitid'][:15]}",
                        partidas=partidas
                    )
                    l_obj = ContabilidadeService.criar_lancamento(db, empresa_id, l_create)
                    trn.status = "CONCILIADO"
                    trn.lancamento_id = l_obj.id
                    auto_conciliadas += 1
                    break

        db.commit()
        return {
            "total_encontradas": len(parsed),
            "importadas": importadas,
            "duplicadas": duplicadas,
            "auto_conciliadas": auto_conciliadas
        }

