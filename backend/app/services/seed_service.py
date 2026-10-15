from datetime import date
from sqlalchemy.orm import Session
from app.models.models import Empresa, ContaContabil, CentroCusto, Lancamento, Partida, RegraConciliacao

PLANO_CONTAS_PADRAO = [
    # 1 - ATIVO
    ("1", 1, "ATIVO", "SINTETICA", "DEVEDORA", "ATIVO", 1, "1"),
    ("1.1", 2, "ATIVO CIRCULANTE", "SINTETICA", "DEVEDORA", "ATIVO", 2, "1.01"),
    ("1.1.01", 3, "DISPONIBILIDADES", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.01"),
    ("1.1.01.001", 10, "Caixa Geral", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.01.01"),
    ("1.1.01.002", 20, "Banco Itaú C/C", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.02.01"),
    ("1.1.01.003", 25, "Banco Bradesco C/C", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.02.02"),
    ("1.1.01.004", 30, "Aplicações de Liquidez Imediata", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.01.03.01"),
    ("1.1.02", 4, "CLIENTES E CONTAS A RECEBER", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.02"),
    ("1.1.02.001", 40, "Clientes Nacionais", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.02.01.01"),
    ("1.1.02.002", 45, "(-) Provisão para Devedores Duvidosos (PCLD)", "ANALITICA", "CREDORA", "ATIVO", 4, "1.01.02.01.09"),
    ("1.1.03", 5, "ESTOQUES", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.03"),
    ("1.1.03.001", 50, "Mercadorias para Revenda", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.03.01.01"),
    ("1.1.04", 6, "TRIBUTOS A RECUPERAR", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.01.04"),
    ("1.1.04.001", 60, "ICMS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.01"),
    ("1.1.04.002", 61, "PIS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.02"),
    ("1.1.04.003", 62, "COFINS a Recuperar", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.03"),
    ("1.1.04.004", 63, "CBS a Recuperar (Reforma Tributária)", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.04"),
    ("1.1.04.005", 64, "IBS a Recuperar (Reforma Tributária)", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.01.04.01.05"),

    ("1.2", 7, "ATIVO NÃO CIRCULANTE", "SINTETICA", "DEVEDORA", "ATIVO", 2, "1.02"),
    ("1.2.01", 8, "IMOBILIZADO", "SINTETICA", "DEVEDORA", "ATIVO", 3, "1.02.01"),
    ("1.2.01.001", 80, "Computadores e Equipamentos", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.02.01.01.01"),
    ("1.2.01.002", 81, "Móveis e Utensílios", "ANALITICA", "DEVEDORA", "ATIVO", 4, "1.02.01.01.02"),
    ("1.2.01.003", 85, "(-) Depreciação Acumulada", "ANALITICA", "CREDORA", "ATIVO", 4, "1.02.01.01.09"),

    # 2 - PASSIVO
    ("2", 100, "PASSIVO", "SINTETICA", "CREDORA", "PASSIVO", 1, "2"),
    ("2.1", 101, "PASSIVO CIRCULANTE", "SINTETICA", "CREDORA", "PASSIVO", 2, "2.01"),
    ("2.1.01", 102, "OBRIGAÇÕES TRABALHISTAS E PREVIDENCIÁRIAS", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.01"),
    ("2.1.01.001", 110, "Salários e Ordenados a Pagar", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.01.01"),
    ("2.1.01.002", 111, "INSS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.02.01"),
    ("2.1.01.003", 112, "FGTS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.02.02"),
    ("2.1.01.004", 115, "Provisão de Férias e 13º Salário", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.01.03.01"),
    ("2.1.02", 103, "FORNECEDORES", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.02"),
    ("2.1.02.001", 120, "Fornecedores Nacionais", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.02.01.01"),
    ("2.1.03", 104, "OBRIGAÇÕES FISCAIS / TRIBUTÁRIAS", "SINTETICA", "CREDORA", "PASSIVO", 3, "2.01.03"),
    ("2.1.03.001", 130, "Simples Nacional a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.01"),
    ("2.1.03.002", 131, "IRPJ e CSLL a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.02"),
    ("2.1.03.003", 132, "PIS / COFINS a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.03"),
    ("2.1.03.004", 133, "ISSQN a Recolher", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.04"),
    ("2.1.03.005", 134, "CBS a Recolher (Reforma)", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.05"),
    ("2.1.03.006", 135, "IBS a Recolher (Reforma)", "ANALITICA", "CREDORA", "PASSIVO", 4, "2.01.03.01.06"),

    # 3 - PATRIMÔNIO LÍQUIDO
    ("3", 200, "PATRIMÔNIO LÍQUIDO", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 1, "2.03"),
    ("3.1", 201, "CAPITAL SOCIAL", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 2, "2.03.01"),
    ("3.1.01.001", 210, "Capital Social Subscrito e Integralizado", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.01.01.01"),
    ("3.2", 202, "LUCROS OU PREJUÍZOS ACUMULADOS", "SINTETICA", "CREDORA", "PATRIMONIO_LIQUIDO", 2, "2.03.04"),
    ("3.2.01.001", 220, "Lucros Acumulados de Exercícios Anteriores", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.04.01.01"),
    ("3.2.01.002", 225, "Resultado do Exercício Atual", "ANALITICA", "CREDORA", "PATRIMONIO_LIQUIDO", 4, "2.03.04.01.02"),

    # 4 - CUSTOS E DESPESAS (RESULTADO)
    ("4", 300, "CONTAS DE RESULTADO - DESPESAS E CUSTOS", "SINTETICA", "DEVEDORA", "DESPESAS", 1, "3"),
    ("4.1", 301, "CUSTOS DOS SERVIÇOS E MERCADORIAS", "SINTETICA", "DEVEDORA", "CUSTOS", 2, "3.01"),
    ("4.1.01.001", 310, "Custo das Mercadorias Vendidas (CMV)", "ANALITICA", "DEVEDORA", "CUSTOS", 4, "3.01.01.01.01"),
    ("4.1.01.002", 315, "Custo dos Serviços Prestados (CSP)", "ANALITICA", "DEVEDORA", "CUSTOS", 4, "3.01.01.01.02"),
    ("4.2", 302, "DESPESAS OPERACIONAIS", "SINTETICA", "DEVEDORA", "DESPESAS", 2, "3.02"),
    ("4.2.01", 303, "DESPESAS ADMINISTRATIVAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.01"),
    ("4.2.01.001", 320, "Aluguel e Condomínio", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.01"),
    ("4.2.01.002", 321, "Energia Elétrica, Água e Internet", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.02"),
    ("4.2.01.003", 322, "Material de Escritório e Informática", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.03"),
    ("4.2.01.004", 323, "Honorários Contábeis e Jurídicos", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.01.01.04"),
    ("4.2.02", 304, "DESPESAS COM PESSOAL", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.02"),
    ("4.2.02.001", 330, "Salários, Pró-Labore e Benefícios", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.02.01.01"),
    ("4.2.02.002", 331, "Encargos Sociais (INSS / FGTS)", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.02.01.02"),
    ("4.2.03", 305, "DESPESAS FINANCEIRAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.03"),
    ("4.2.03.001", 340, "Tarifas Bancárias e Manutenção de Conta", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.03.01.01"),
    ("4.2.03.002", 341, "Juros Passivos e Multas", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.03.01.02"),
    ("4.2.04", 306, "DESPESAS TRIBUTÁRIAS", "SINTETICA", "DEVEDORA", "DESPESAS", 3, "3.02.04"),
    ("4.2.04.001", 350, "Simples Nacional / DAS", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.04.01.01"),
    ("4.2.04.002", 351, "IRPJ e CSLL do Exercício", "ANALITICA", "DEVEDORA", "DESPESAS", 4, "3.02.04.01.02"),

    # 5 - RECEITAS (RESULTADO)
    ("5", 400, "CONTAS DE RESULTADO - RECEITAS", "SINTETICA", "CREDORA", "RECEITAS", 1, "4"),
    ("5.1", 401, "RECEITA OPERACIONAL BRUTA", "SINTETICA", "CREDORA", "RECEITAS", 2, "4.01"),
    ("5.1.01.001", 410, "Receita de Prestação de Serviços Contábeis/TI", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.01.01.01.01"),
    ("5.1.01.002", 420, "Receita de Venda de Mercadorias", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.01.01.02.01"),
    ("5.2", 402, "RECEITAS FINANCEIRAS", "SINTETICA", "CREDORA", "RECEITAS", 2, "4.02"),
    ("5.2.01.001", 430, "Rendimentos de Aplicações Financeiras", "ANALITICA", "CREDORA", "RECEITAS", 4, "4.02.01.01.01"),
]

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Empresa).first():
        return

    # 1. Create Default Demo Company
    empresa = Empresa(
        cnpj="12.345.678/0001-90",
        razao_social="PHOENIX CONSULTORIA & SERVIÇOS CONTÁBEIS LTDA",
        nome_fantasia="Phoenix Soluções Contábeis",
        inscricao_estadual="111.222.333.444",
        inscricao_municipal="555.666-7",
        regime_tributario="SIMPLES",
        cnae="6920-6/01",
        cidade="São Paulo",
        uf="SP",
        ano_exercicio=2026,
        data_bloqueio=None
    )
    db.add(empresa)
    db.commit()
    db.refresh(empresa)

    # 2. Centros de Custo
    cc1 = CentroCusto(empresa_id=empresa.id, codigo="01", nome="Administrativo / Diretoria")
    cc2 = CentroCusto(empresa_id=empresa.id, codigo="02", nome="Operações Contábeis & Fiscais")
    cc3 = CentroCusto(empresa_id=empresa.id, codigo="03", nome="Comercial & Marketing")
    db.add_all([cc1, cc2, cc3])
    db.commit()

    # 3. Create Chart of Accounts
    contas_map = {}
    for cod, cod_red, desc, tipo, nat, grupo, nivel, ref_rfb in PLANO_CONTAS_PADRAO:
        conta = ContaContabil(
            empresa_id=empresa.id,
            codigo=cod,
            codigo_reduzido=cod_red,
            descricao=desc,
            tipo=tipo,
            natureza=nat,
            grupo=grupo,
            nivel=nivel,
            codigo_referencial_rfb=ref_rfb,
            ativa=True
        )
        db.add(conta)
        db.flush()
        contas_map[cod_red] = conta.id

    db.commit()

    # 4. Regras de Conciliação OFX
    regra1 = RegraConciliacao(
        empresa_id=empresa.id,
        padrao_texto="TARIFA",
        conta_contrapartida_id=contas_map[340], # Tarifas Bancárias
        centro_custo_id=cc1.id,
        historico_padrao="Despesa com tarifa bancária s/ extrato",
        ativa=True
    )
    regra2 = RegraConciliacao(
        empresa_id=empresa.id,
        padrao_texto="RENDIMENTO",
        conta_contrapartida_id=contas_map[430], # Rendimentos de Aplicação
        centro_custo_id=cc1.id,
        historico_padrao="Receita de rendimento de aplicação financeira",
        ativa=True
    )
    db.add_all([regra1, regra2])
    db.commit()

    # 5. Lançamentos Iniciais de Demonstração (Exercício 2026)
    # Lançamento 1: Integralização de Capital Social (R$ 50.000 no Banco)
    l1 = Lancamento(
        empresa_id=empresa.id,
        numero=1,
        data=date(2026, 1, 5),
        tipo="ABERTURA",
        historico="Integralização de Capital Social conforme Contrato Social registrado",
        documento="CONTRATO-01",
        conciliado=True
    )
    db.add(l1)
    db.flush()
    p1 = Partida(lancamento_id=l1.id, conta_id=contas_map[20], tipo="DEBITO", valor=50000.0, complemento="Entrada em conta Banco Itaú")
    p2 = Partida(lancamento_id=l1.id, conta_id=contas_map[210], tipo="CREDITO", valor=50000.0, complemento="Capital subscrito e integralizado pelos sócios")
    db.add_all([p1, p2])

    # Lançamento 2: Aquisição de Computadores e Móveis (R$ 12.000 via Banco)
    l2 = Lancamento(
        empresa_id=empresa.id,
        numero=2,
        data=date(2026, 1, 10),
        tipo="ORDINARIO",
        historico="Aquisição de equipamentos de TI e mobiliário para escritório s/ NF 4589",
        documento="NF-4589",
        conciliado=True
    )
    db.add(l2)
    db.flush()
    p3 = Partida(lancamento_id=l2.id, conta_id=contas_map[80], tipo="DEBITO", valor=8000.0, centro_custo_id=cc2.id)
    p4 = Partida(lancamento_id=l2.id, conta_id=contas_map[81], tipo="DEBITO", valor=4000.0, centro_custo_id=cc1.id)
    p5 = Partida(lancamento_id=l2.id, conta_id=contas_map[20], tipo="CREDITO", valor=12000.0)
    db.add_all([p3, p4, p5])

    # Lançamento 3: Receita de Prestação de Serviços (R$ 35.000 faturado)
    l3 = Lancamento(
        empresa_id=empresa.id,
        numero=3,
        data=date(2026, 1, 20),
        tipo="ORDINARIO",
        historico="Faturamento de serviços contábeis e consultoria tributária do mês s/ NFS-e 101",
        documento="NFSE-101",
        conciliado=False
    )
    db.add(l3)
    db.flush()
    p6 = Partida(lancamento_id=l3.id, conta_id=contas_map[40], tipo="DEBITO", valor=35000.0, complemento="Clientes a Receber")
    p7 = Partida(lancamento_id=l3.id, conta_id=contas_map[410], tipo="CREDITO", valor=35000.0, centro_custo_id=cc2.id)
    db.add_all([p6, p7])

    # Lançamento 4: Recebimento parcial de clientes no Banco Itaú (R$ 25.000)
    l4 = Lancamento(
        empresa_id=empresa.id,
        numero=4,
        data=date(2026, 1, 25),
        tipo="ORDINARIO",
        historico="Recebimento de honorários contábeis de clientes via PIX no Banco Itaú",
        documento="PIX-REC-01",
        conciliado=True
    )
    db.add(l4)
    db.flush()
    p8 = Partida(lancamento_id=l4.id, conta_id=contas_map[20], tipo="DEBITO", valor=25000.0)
    p9 = Partida(lancamento_id=l4.id, conta_id=contas_map[40], tipo="CREDITO", valor=25000.0)
    db.add_all([p8, p9])

    # Lançamento 5: Folha de Pagamento e Encargos (R$ 15.000 Salários + Provisões)
    l5 = Lancamento(
        empresa_id=empresa.id,
        numero=5,
        data=date(2026, 1, 31),
        tipo="ORDINARIO",
        historico="Apropriação da folha de pagamento do mês de janeiro/2026",
        documento="FOLHA-01/2026",
        conciliado=False
    )
    db.add(l5)
    db.flush()
    p10 = Partida(lancamento_id=l5.id, conta_id=contas_map[330], tipo="DEBITO", valor=12000.0, centro_custo_id=cc2.id)
    p11 = Partida(lancamento_id=l5.id, conta_id=contas_map[331], tipo="DEBITO", valor=3000.0, centro_custo_id=cc2.id)
    p12 = Partida(lancamento_id=l5.id, conta_id=contas_map[110], tipo="CREDITO", valor=12000.0)
    p13 = Partida(lancamento_id=l5.id, conta_id=contas_map[111], tipo="CREDITO", valor=3000.0)
    db.add_all([p10, p11, p12, p13])

    # Lançamento 6: Despesas de Aluguel e Internet (R$ 3.500 pagos pelo Banco Itaú)
    l6 = Lancamento(
        empresa_id=empresa.id,
        numero=6,
        data=date(2026, 1, 31),
        tipo="ORDINARIO",
        historico="Pagamento de despesas operacionais - aluguel e internet s/ recibos",
        documento="REC-LOC-01",
        conciliado=True
    )
    db.add(l6)
    db.flush()
    p14 = Partida(lancamento_id=l6.id, conta_id=contas_map[320], tipo="DEBITO", valor=2800.0, centro_custo_id=cc1.id)
    p15 = Partida(lancamento_id=l6.id, conta_id=contas_map[321], tipo="DEBITO", valor=700.0, centro_custo_id=cc1.id)
    p16 = Partida(lancamento_id=l6.id, conta_id=contas_map[20], tipo="CREDITO", valor=3500.0)
    db.add_all([p14, p15, p16])

    # Lançamento 7: Provisão de Tributos Simples Nacional (R$ 2.100)
    l7 = Lancamento(
        empresa_id=empresa.id,
        numero=7,
        data=date(2026, 1, 31),
        tipo="ORDINARIO",
        historico="Provisão para tributos do Simples Nacional competência 01/2026",
        documento="DAS-01/2026",
        conciliado=False
    )
    db.add(l7)
    db.flush()
    p17 = Partida(lancamento_id=l7.id, conta_id=contas_map[350], tipo="DEBITO", valor=2100.0, centro_custo_id=cc1.id)
    p18 = Partida(lancamento_id=l7.id, conta_id=contas_map[130], tipo="CREDITO", valor=2100.0)
    db.add_all([p17, p18])

    db.commit()

