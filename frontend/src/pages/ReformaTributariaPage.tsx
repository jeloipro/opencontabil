import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { Calculator, Sparkles, TrendingUp, TrendingDown, ArrowRight, CheckCircle2 } from "lucide-react";

interface Props {
  empresaId: number;
}

export const ReformaTributariaPage: React.FC<Props> = ({ empresaId }) => {
  const [faturamento, setFaturamento] = useState<number>(100000);
  const [compras, setCompras] = useState<number>(35000);
  const [folha, setFolha] = useState<number>(25000);
  const [regimeAtual, setRegimeAtual] = useState<string>("LUCRO_PRESUMIDO");
  const [aliqCbs, setAliqCbs] = useState<number>(8.8);
  const [aliqIbs, setAliqIbs] = useState<number>(17.7);
  const [aliqIs, setAliqIs] = useState<number>(0.0);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    calcular();
  }, [faturamento, compras, folha, regimeAtual, aliqCbs, aliqIbs, aliqIs]);

  const calcular = async () => {
    setLoading(true);
    try {
      const res = await api.simularReforma({
        faturamento_mensal: faturamento,
        compras_insumos_mensal: compras,
        folha_salarios_mensal: folha,
        regime_atual: regimeAtual,
        aliquota_cbs: aliqCbs,
        aliquota_ibs: aliqIbs,
        aliquota_is: aliqIs,
      });
      setResultado(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md">
        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Emenda Constitucional 132/2023</span>
        </div>
        <h2 className="text-2xl font-bold">Simulador da Reforma Tributária (CBS + IBS + IS)</h2>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">
          Simule o impacto da substituição de PIS, COFINS, ICMS e ISS pelos novos tributos sobre o consumo,
          com cálculo em tempo real do aproveitamento pleno de créditos sobre insumos.
        </p>
      </div>

      {/* Grid: Parâmetros vs Resultado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Parâmetros de Entrada */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="font-bold text-slate-800 text-base">Parâmetros Operacionais</h3>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Faturamento Bruto Mensal (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={faturamento}
              onChange={(e) => setFaturamento(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Compras de Insumos / Serviços com Crédito (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={compras}
              onChange={(e) => setCompras(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-slate-800"
            />
            <span className="text-[11px] text-slate-400">
              Gera crédito integral de CBS ({aliqCbs}%) e IBS ({aliqIbs}%)
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Folha Salarial Mensal (R$)
            </label>
            <input
              type="number"
              step="1000"
              value={folha}
              onChange={(e) => setFolha(Number(e.target.value))}
              className="w-full px-3 py-2 border rounded-lg text-sm font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Regime Tributário Atual de Comparação
            </label>
            <select
              value={regimeAtual}
              onChange={(e) => setRegimeAtual(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-xs font-semibold"
            >
              <option value="LUCRO_PRESUMIDO">Lucro Presumido</option>
              <option value="SIMPLES">Simples Nacional</option>
              <option value="LUCRO_REAL">Lucro Real</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase text-slate-400">Alíquotas de Referência:</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">CBS (Federal)</span>
                <span className="font-bold text-blue-700">{aliqCbs}%</span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-200">
                <span className="text-slate-500 block">IBS (Subnacional)</span>
                <span className="font-bold text-indigo-700">{aliqIbs}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Comparativo de Impacto */}
        <div className="lg:col-span-2 space-y-6">
          {resultado && (
            <>
              {/* Cards Comparativos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Tributação Atual */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Cenário Atual ({regimeAtual.replace("_", " ")})
                  </span>
                  <div className="text-3xl font-black text-slate-800 mt-2 font-mono">
                    R${" "}
                    {resultado.tributacao_atual.total_mensal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                    <span className="text-xs font-sans text-slate-400 font-normal"> / mês</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <p>Total Anual: R$ {(resultado.tributacao_atual.total_mensal * 12).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                {/* Nova Reforma */}
                <div className="bg-white p-5 rounded-xl border-2 border-blue-500 shadow-2xs relative">
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Novo Modelo (CBS + IBS + IS)</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      EC 132/23
                    </span>
                  </span>
                  <div className="text-3xl font-black text-blue-700 mt-2 font-mono">
                    R${" "}
                    {resultado.tributacao_nova_reforma.total_mensal.toLocaleString("pt-BR", {
                      minimumFractionDigits: 2,
                    })}
                    <span className="text-xs font-sans text-slate-400 font-normal"> / mês</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100 space-y-1">
                    <p>
                      Crédito Recuperado s/ Insumos:{" "}
                      <strong className="text-emerald-600">
                        R$ {resultado.credito_cbs_ibs_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} / mês
                      </strong>
                    </p>
                  </div>
                </div>
              </div>

              {/* Variação e Diagnóstico */}
              <div
                className={`p-5 rounded-xl border flex items-start gap-3 ${
                  resultado.diferenca_mensal > 0
                    ? "bg-amber-50 border-amber-200 text-amber-900"
                    : "bg-emerald-50 border-emerald-200 text-emerald-900"
                }`}
              >
                {resultado.diferenca_mensal > 0 ? (
                  <TrendingUp className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingDown className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {resultado.diferenca_mensal > 0
                      ? `Variação Estimada: +R$ ${resultado.diferenca_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês (+${resultado.variacao_percentual}%)`
                      : `Economia Estimada: R$ ${Math.abs(resultado.diferenca_mensal).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês (${resultado.variacao_percentual}%)`}
                  </h4>
                  <p className="text-xs mt-1 leading-relaxed opacity-90">{resultado.diagnostico}</p>
                </div>
              </div>

              {/* Detalhamento dos Tributos da Reforma */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="font-bold text-slate-800 text-sm mb-3">Composição da Carga no Novo Sistema</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">CBS Líquida</span>
                    <span className="font-mono font-bold text-blue-700 text-sm">
                      R$ {resultado.tributacao_nova_reforma.cbs_liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">IBS Líquido</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">
                      R$ {resultado.tributacao_nova_reforma.ibs_liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">Créditos de Entrada</span>
                    <span className="font-mono font-bold text-emerald-600 text-sm">
                      R$ {resultado.credito_cbs_ibs_mensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span className="text-slate-500 block">IRPJ/CSLL Mantido</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">
                      R$ {resultado.tributacao_nova_reforma.irpj_csll_mantido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
