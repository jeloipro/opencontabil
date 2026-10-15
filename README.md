# OpenContábil Phoenix 🇧🇷

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Python 3.11+](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg)](https://fastapi.tiangolo.com)
[![React 19](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0%2B-3178c6.svg)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38bdf8.svg)](https://tailwindcss.com)
[![SPED ECD Ready](https://img.shields.io/badge/SPED-ECD%20RFB-emerald.svg)](https://www.gov.br/receitafederal)

> **Sistema Contábil Open Source completo e moderno**, inspirado no **Contábil Phoenix (Contmatic)**, projetado para escritórios de contabilidade e empresas com departamento contábil interno no Brasil.
> 
> Engenharia reversa realizada com base nas especificações legais brasileiras (CFC / CVM / RFB) e na arquitetura funcional do sistema de referência.

---

## 🌟 Principais Funcionalidades

### 1. 📑 Escrituração Contábil (Partidas Dobradas)
- Lançamentos em partidas simples (1D / 1C) ou múltiplas (vários D / vários C).
- **Validação estrita de fechamento em tempo real**: impossibilita a gravação de lançamentos desbalanceados ($\sum Débitos = \sum Créditos$).
- Código reduzido para digitação rápida por teclado (padrão clássico dos escritórios contábeis).
- Bloqueio por data de encerramento do exercício/período fiscal.
- Suporte a Centros de Custo e detalhamento analítico.

### 2. 🌳 Plano de Contas Referencial (RFB / SPED)
- Estrutura multinível completa (1-Ativo, 2-Passivo, 3-Patrimônio Líquido, 4-Custos/Despesas, 5-Receitas).
- Separação entre contas **Sintéticas** (totalizadoras) e **Analíticas** (que recebem lançamentos).
- **Mapeamento nativo com o Plano de Contas Referencial da Receita Federal do Brasil (RFB)** para emissão de SPED ECD e ECF.

### 3. 🏦 Conciliação Bancária Inteligente (OFX)
- Parser universal de extratos `.ofx` (SGML e XML) de qualquer instituição financeira brasileira (Itaú, Bradesco, Santander, Banco do Brasil, Inter, Nubank, Sicoob, etc.).
- Detecção e prevenção contra duplicidade por `FITID`.
- **Regras inteligentes de conciliação automática**: converte descrições bancárias (ex: "Tarifa", "Rendimento", "PIX") diretamente em partidas contábeis sem intervenção humana.
- Conciliação manual assistida em 1 clique.

### 4. 📊 Livros e Demonstrações Contábeis Oficiais
- **Balancete de Verificação (4 colunas)**: saldo anterior, movimentação de débito, crédito e saldo final com totalizadores por grau sintético.
- **Balanço Patrimonial (NBC TG 26 / Lei 6.404/76)**: visualização em duas colunas (Ativo vs Passivo + PL) com checagem automática da equação patrimonial ($A = P + PL$).
- **DRE (Demonstração do Resultado do Exercício)**: cálculo estruturado de Receita Bruta, Deduções, CMV, Lucro Bruto, Despesas Operacionais, Resultado Financeiro e Lucro/Prejuízo Líquido.
- **Livro Diário Geral**: com termos de abertura/encerramento, paginação e partidas cronológicas.
- **Livro Razão por Conta**: ficha de razão por conta analítica com histórico de movimentações e saldo progressivo.
- **Índices de Análise Financeira**: Liquidez Corrente, Liquidez Seca, Grau de Endividamento e Margem Líquida.

### 5. 🏛️ SPED ECD & Auditoria Fiscal
- **Exportação oficial do arquivo magnético SPED ECD (.txt)** nos padrões da Receita Federal:
  - **Bloco 0**: Identificação, participantes e cadastro da pessoa jurídica.
  - **Bloco I**: Livro Diário Geral, Plano de Contas (I050), Mapeamento RFB (I051) e Lançamentos (I200/I250).
  - **Bloco J**: Demonstrações Contábeis (J100 Balanço e J150 DRE) e Termos de Abertura/Encerramento assinados pelo Contador (CRC) e Administrador.
  - **Bloco 9**: Totalizadores e fechamento de registros.
- **Pré-Validador embutido**: audita pendências antes de transmitir ao Programa Validador e Assinador (PVA) da RFB.

### 6. ⚖️ Simulador da Reforma Tributária (EC 132/2023)
- Simulador interativo da transição tributária brasileira:
- Comparativo entre o regime atual (Simples Nacional, Lucro Presumido ou Lucro Real) e o novo modelo:
  - **CBS** (Contribuição sobre Bens e Serviços - Federal - 8,8%)
  - **IBS** (Imposto sobre Bens e Serviços - Estadual/Municipal - 17,7%)
  - **Imposto Seletivo (IS)**
- Cálculo do aproveitamento integral de **créditos sobre aquisições de insumos e serviços**.

### 7. 🏢 Multi-Empresa & Escritório Contábil
- Gestão centralizada de múltiplos CNPJs (clientes ou filiais).
- Troca de empresa ativa instantânea pelo cabeçalho sem recarregar a aplicação.
- Auto-provisionamento de plano de contas padrão para novas empresas.

---

## 🛠️ Stack Tecnológica Unificada (100% TypeScript)

Todo o sistema foi unificado em uma **única base full-stack TypeScript** para máxima compatibilidade local e deploy instantâneo no **Vercel**:

| Camada | Tecnologia |
|---|---|
| **Linguagem Única** | TypeScript 5.3+ |
| **Backend & API** | Node.js, Express, Vercel Serverless Functions (`api/index.ts`) |
| **Frontend** | React 19, Vite, Tailwind CSS, Lucide Icons |
| **Banco & Camada de Serviços** | Repositório em memória com persistência e auto-provisionamento de dados |
| **Deploy** | 1-Click Deploy no Vercel (`vercel.json`), Docker, Scripts `.bat` e `.sh` |

---

## 🚀 Como Executar Localmente (1 Comando)

Basta ter o **Node.js 18+** instalado:

```bash
npm install
npm run dev
```

*(Ou simplesmente dê dois cliques no arquivo `start.bat` no Windows)*

O sistema iniciará o **Backend e o Frontend juntos** na mesma porta:
👉 **http://localhost:3000**

---

## ☁️ Deploy no Vercel (1 Clique)

O projeto já possui o `vercel.json` e a Serverless Function `api/index.ts` configurados na raiz:

1. Faça o push do projeto para o seu GitHub:
   ```bash
   git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
   git push -u origin main
   ```
2. Acesse **[vercel.com/new](https://vercel.com/new)** e conecte seu repositório.
3. Clique em **"Deploy"** (não precisa alterar nenhuma configuração).
4. O Vercel gerará automaticamente o link público (ex: `https://opencontabil-phoenix.vercel.app`) com o front e o back funcionando juntos!

---

### 2. Executando com Docker

Se preferir rodar em contêineres isolados com 1 comando:
```bash
docker compose up --build
```
Acesse **http://localhost:8000**.

---

### 3. Executando em Modo de Desenvolvimento (Hot-Reload)

**Terminal 1 — Backend (FastAPI):**
```bash
cd backend
pip install -r requirements.txt
python run.py
```
*(Documentação Swagger interativa disponível em http://localhost:8000/docs)*

**Terminal 2 — Frontend (Vite / React):**
```bash
cd frontend
npm install
npm run dev
```
*(Interface disponível em http://localhost:5173 com proxy para o backend na porta 8000)*

---

## 🧪 Executando os Testes Automatizados

O sistema conta com suíte completa de testes unitários e de integração testando regras contábeis, fechamentos de balanço, simulações tributárias e endpoints REST:

```bash
python -m pytest backend/tests -v
```

Resultado:
```text
backend/tests/test_api_endpoints.py::test_health PASSED
backend/tests/test_api_endpoints.py::test_get_empresas PASSED
backend/tests/test_api_endpoints.py::test_dashboard PASSED
backend/tests/test_api_endpoints.py::test_balancete PASSED
backend/tests/test_api_endpoints.py::test_balanco_patrimonial PASSED
backend/tests/test_api_endpoints.py::test_dre PASSED
backend/tests/test_api_endpoints.py::test_sped_ecd_export PASSED
backend/tests/test_api_endpoints.py::test_simular_reforma PASSED
backend/tests/test_contabilidade.py::test_seed_creates_company_and_accounts PASSED
backend/tests/test_contabilidade.py::test_criar_lancamento_balanceado PASSED
backend/tests/test_contabilidade.py::test_rejeitar_lancamento_desbalanceado PASSED
backend/tests/test_contabilidade.py::test_gerar_balancete_e_dre PASSED
backend/tests/test_contabilidade.py::test_gerar_sped_ecd PASSED
backend/tests/test_contabilidade.py::test_parser_ofx PASSED
backend/tests/test_contabilidade.py::test_reforma_tributaria_simulacao PASSED

15 passed in 3.32s (100% de sucesso)
```

---

## 📁 Estrutura do Repositório

```text
CONTABIL/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── dashboard.py          # KPIs executivos e gráficos
│   │   │   │   ├── empresas.py           # Gestão multi-empresa
│   │   │   │   ├── plano_contas.py       # Plano de contas e RFB
│   │   │   │   ├── lancamentos.py        # Partidas dobradas
│   │   │   │   ├── centros_custo.py      # Centros de custo
│   │   │   │   ├── relatorios.py         # Balancete, Balanço, DRE, Livros
│   │   │   │   ├── conciliacao.py        # Extratos OFX e regras automáticas
│   │   │   │   └── fiscal_sped.py        # Exportação SPED ECD e Reforma
│   │   │   └── router.py
│   │   ├── core/
│   │   │   ├── config.py                 # Configurações do sistema
│   │   │   └── database.py               # Sessões SQLAlchemy
│   │   ├── models/
│   │   │   └── models.py                 # Entidades ORM do banco
│   │   ├── schemas/
│   │   │   └── schemas.py                # Validação Pydantic v2
│   │   ├── services/
│   │   │   ├── contabilidade_service.py  # Lógica contábil e numeração
│   │   │   ├── relatorios_service.py     # Balanço, DRE, Balancete, Índices
│   │   │   ├── ofx_parser_service.py     # Parser SGML/XML e automações
│   │   │   ├── sped_ecd_service.py       # Gerador e validador SPED ECD
│   │   │   ├── reforma_tributaria_service.py # Simulação CBS/IBS EC 132/23
│   │   │   └── seed_service.py           # População com empresa e plano modelo
│   │   └── main.py                       # App FastAPI + static SPA server
│   ├── tests/
│   │   ├── test_contabilidade.py         # Testes de regras de negócio
│   │   └── test_api_endpoints.py         # Testes dos endpoints HTTP
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx                # Seletor de empresa e status
│   │   │   ├── Sidebar.tsx               # Menu lateral dos módulos
│   │   │   └── NovoLancamentoModal.tsx   # Modal de partidas dobradas
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx         # Dashboard com métricas e gráficos
│   │   │   ├── LancamentosPage.tsx       # Lançamentos e detalhes de partidas
│   │   │   ├── PlanoContasPage.tsx       # Plano estrutural e referencial RFB
│   │   │   ├── ConciliacaoPage.tsx       # Extrato OFX e auto-conciliação
│   │   │   ├── BalancetePage.tsx         # Balancete de 4 colunas
│   │   │   ├── BalancoPatrimonialPage.tsx# Balanço Patrimonial estruturado
│   │   │   ├── DREPage.tsx               # DRE oficial estruturada
│   │   │   ├── LivrosPage.tsx            # Livro Diário Geral e Razão
│   │   │   ├── SpedPage.tsx              # Geração SPED ECD e Pré-Auditoria
│   │   │   ├── ReformaTributariaPage.tsx # Simulador EC 132/2023
│   │   │   └── EmpresasPage.tsx          # Gestão Multi-Empresa
│   │   ├── services/
│   │   │   └── api.ts                    # Cliente HTTP tipado
│   │   ├── App.tsx                       # Shell do sistema
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── Dockerfile
├── run.py                                # Launcher raiz
├── start.bat                             # Atalho Windows
├── start.sh                              # Atalho Linux/macOS
├── LICENSE                               # Licença MIT
└── README.md
```

---

## 🤝 Como Contribuir

Contribuições são muito bem-vindas!
1. Faça um Fork do projeto.
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`).
3. Commit suas alterações (`git commit -m 'Adiciona funcionalidade X'`).
4. Push para a branch (`git push origin feature/MinhaFeature`).
5. Abra um **Pull Request**.

---

## 📜 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo [LICENSE](LICENSE) para obter mais detalhes.

