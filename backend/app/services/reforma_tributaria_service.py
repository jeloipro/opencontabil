from app.schemas.schemas import SimuladorReformaRequest, SimuladorReformaResponse

class ReformaTributariaService:

    @staticmethod
    def simular(dados: SimuladorReformaRequest) -> SimuladorReformaResponse:
        faturamento = dados.faturamento_mensal
        compras = dados.compras_insumos_mensal
        folha = dados.folha_salarios_mensal
        regime = dados.regime_atual

        # 1. Regime Atual
        if regime == "SIMPLES":
            # Anexo III / IV médio ~ 11%
            aliq_efetiva = 0.115
            imposto_atual = faturamento * aliq_efetiva
            detalhe_atual = {
                "regime": "Simples Nacional",
                "aliquota_efetiva": "11.50%",
                "tributos_inclusos": ["IRPJ", "CSLL", "PIS", "COFINS", "ISS", "CPP"],
                "total_mensal": round(imposto_atual, 2)
            }
        elif regime == "LUCRO_PRESUMIDO":
            # PIS (0.65%) + COFINS (3.0%) + ISS (2% a 5%, med 3%) + IRPJ/CSLL pres. (4.8% serviços) = ~11.45% a 16.33%
            pis = faturamento * 0.0065
            cofins = faturamento * 0.0300
            iss = faturamento * 0.0400
            irpj_csll = faturamento * 0.0480
            imposto_atual = pis + cofins + iss + irpj_csll
            detalhe_atual = {
                "regime": "Lucro Presumido",
                "pis": round(pis, 2),
                "cofins": round(cofins, 2),
                "iss": round(iss, 2),
                "irpj_csll": round(irpj_csll, 2),
                "total_mensal": round(imposto_atual, 2)
            }
        else: # LUCRO REAL
            # PIS (1.65%) + COFINS (7.6%) não cumulativo sobre valor agregado
            pis_deb = faturamento * 0.0165
            cofins_deb = faturamento * 0.0760
            pis_cred = compras * 0.0165
            cofins_cred = compras * 0.0760
            pis_cofins_liq = max(0.0, (pis_deb - pis_cred) + (cofins_deb - cofins_cred))
            iss = faturamento * 0.0400
            # Estimativa de IRPJ/CSLL (34% s/ margem de 15%)
            irpj_csll = (faturamento - compras - folha) * 0.34
            imposto_atual = pis_cofins_liq + iss + max(0.0, irpj_csll)
            detalhe_atual = {
                "regime": "Lucro Real",
                "pis_cofins_liquido": round(pis_cofins_liq, 2),
                "iss": round(iss, 2),
                "irpj_csll_estimado": round(max(0.0, irpj_csll), 2),
                "total_mensal": round(imposto_atual, 2)
            }

        # 2. Nova Reforma Tributária (CBS + IBS + IS)
        # Princípio da não-cumulatividade plena sobre todas as aquisições de insumos e bens
        aliq_cbs_dec = dados.aliquota_cbs / 100.0
        aliq_ibs_dec = dados.aliquota_ibs / 100.0
        aliq_is_dec = dados.aliquota_is / 100.0

        cbs_debito = faturamento * aliq_cbs_dec
        ibs_debito = faturamento * aliq_ibs_dec
        is_debito = faturamento * aliq_is_dec

        cbs_credito = compras * aliq_cbs_dec
        ibs_credito = compras * aliq_ibs_dec

        cbs_a_recolher = max(0.0, cbs_debito - cbs_credito)
        ibs_a_recolher = max(0.0, ibs_debito - ibs_credito)
        is_a_recolher = is_debito

        # IRPJ e CSLL permanecem aplicáveis
        irpj_csll_reforma = faturamento * 0.0480 if regime != "LUCRO_REAL" else max(0.0, (faturamento - compras - folha) * 0.34)

        total_nova_reforma = cbs_a_recolher + ibs_a_recolher + is_a_recolher + irpj_csll_reforma

        detalhe_novo = {
            "cbs_debito": round(cbs_debito, 2),
            "cbs_credito_insumos": round(cbs_credito, 2),
            "cbs_liquido": round(cbs_a_recolher, 2),
            "ibs_debito": round(ibs_debito, 2),
            "ibs_credito_insumos": round(ibs_credito, 2),
            "ibs_liquido": round(ibs_a_recolher, 2),
            "imposto_seletivo": round(is_a_recolher, 2),
            "irpj_csll_mantido": round(irpj_csll_reforma, 2),
            "total_mensal": round(total_nova_reforma, 2)
        }

        diferenca_mensal = total_nova_reforma - imposto_atual
        diferenca_anual = diferenca_mensal * 12
        var_pct = round((diferenca_mensal / imposto_atual) * 100, 2) if imposto_atual > 0 else 0.0

        credito_mensal_total = cbs_credito + ibs_credito

        if diferenca_mensal > 0:
            diagnostico = (
                f"A empresa terá um acréscimo estimado de R$ {diferenca_mensal:.2f}/mês (+{var_pct}%). "
                f"Recomenda-se maximizar a tomada de créditos sobre fornecedores (compras de insumos e serviços) que geram R$ {credito_mensal_total:.2f}/mês de abatimento de CBS/IBS."
            )
        else:
            diagnostico = (
                f"A empresa terá uma redução estimada de R$ {abs(diferenca_mensal):.2f}/mês ({var_pct}%). "
                f"A não-cumulatividade plena sobre insumos e compras proporciona R$ {credito_mensal_total:.2f}/mês de créditos."
            )

        return SimuladorReformaResponse(
            tributacao_atual=detalhe_atual,
            tributacao_nova_reforma=detalhe_novo,
            diferenca_mensal=round(diferenca_mensal, 2),
            diferenca_anual=round(diferenca_anual, 2),
            variacao_percentual=var_pct,
            credito_cbs_ibs_mensal=round(credito_mensal_total, 2),
            diagnostico=diagnostico
        )

