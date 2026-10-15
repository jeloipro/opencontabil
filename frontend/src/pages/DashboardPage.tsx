import React, { useEffect, useState } from "react";
import { api } from "../services/api";
import {
  TrendingUp,
  Landmark,
  Scale,
  FileCheck,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Building,
  RefreshCw,
} from "lucide-react";

interface Props {
  empresaId: number;
  onNavigate: (tab: any) => void;
}

export const DashboardPage: React.FC<Props> = ({ empresaId, onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadDashboard();
  }, [empresaId]);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.getDashboard(empresaId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const { resumo, indicadores, evolucao_mensal, ultimos_lancamentos, empresa } = data;

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Building className="w-4 h-4" />
            <span>Escrituração Contábil Ativa</span>
          </div>
          <h2 className="text-2xl font-bold">{empresa.razao_social}</h2>
          <p className="text-slate-400 text-sm mt-1">
            CNPJ: {empresa.cnpj} • Regime: {empresa.regime_tributario} • Exercício {empresa.ano_exercicio}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate("conciliacao")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 shadow-sm"
          >
            <Landmark className="w-4 h-4" />
            <span>Conciliar Extrato OFX ({resumo.ofx_pendentes})</span>
          </button>
          <button
            onClick={() => onNavigate("sped")}
            className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 backdrop-blur-xs"
          >
            <FileCheck className="w-4 h-4" />
            <span>SPED ECD</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Faturamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Receita Bruta Acumulada</span>
            <span className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            R$ {resumo.faturamento_acumulado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-4 h-4" /> +12.5% em relação ao ano ant.
          </p>
        </div>

        {/* Card 2: Lucro Líquido */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Lucro Líquido (DRE)</span>
            <span className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <Scale className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-blue-700 mt-2 font-mono">
            R$ {resumo.lucro_liquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Margem Líquida: <strong className="text-slate-800">{indicadores.margem_liquida_pct}%</strong>
          </p>
        </div>

        {/* Card 3: Ativo Total */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Ativo Total (Balanço)</span>
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Building className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            R$ {resumo.total_ativo.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Liquidez Corrente: <strong className="text-slate-800">{indicadores.liquidez_corrente}</strong>
          </p>
        </div>

        {/* Card 4: Status do Fechamento */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Partidas & Fechamento</span>
            <span className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <FileCheck className="w-5 h-5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2 font-mono">
            {resumo.total_lancamentos}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Lançamentos escriturados no exercício
          </p>
        </div>
      </div>

      {/* Grid: Gráfico de Evolução + Indicadores de Balanço */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Evolução Financeira */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Evolução de Receitas vs Despesas</h3>
              <p className="text-xs text-slate-500">Apuração contábil por competência</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-blue-500" /> Receitas
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-red-400" /> Despesas
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded-full bg-emerald-500" /> Lucro
              </span>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {evolucao_mensal.map((item: any) => {
              const maxVal = Math.max(...evolucao_mensal.map((m: any) => m.receitas));
              const recPct = (item.receitas / maxVal) * 100;
              const despPct = (item.despesas / maxVal) * 100;
              return (
                <div key={item.mes} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>{item.mes}</span>
                    <span className="font-mono">
                      Receitas: R$ {item.receitas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} |
                      Despesas: R$ {item.despesas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${recPct * 0.6}%` }}
                      className="bg-blue-500 h-full rounded-l-full"
                    />
                    <div
                      style={{ width: `${despPct * 0.4}%` }}
                      className="bg-red-400 h-full rounded-r-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indicadores Estruturais */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-800">Saúde & Índices Contábeis</h3>
          <p className="text-xs text-slate-500">Métricas oficiais calculadas do Balanço e DRE</p>

          <div className="space-y-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block">Liquidez Corrente</span>
                <span className="text-xs text-slate-400">Ativo Circ. / Passivo Circ.</span>
              </div>
              <span className="text-lg font-bold font-mono text-blue-700">
                {indicadores.liquidez_corrente}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block">Liquidez Seca</span>
                <span className="text-xs text-slate-400">(Ativo Circ. - Estoque) / Passivo</span>
              </div>
              <span className="text-lg font-bold font-mono text-indigo-700">
                {indicadores.liquidez_seca}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block">Grau de Endividamento</span>
                <span className="text-xs text-slate-400">Passivo Exigível / Ativo Total</span>
              </div>
              <span className="text-lg font-bold font-mono text-slate-800">
                {indicadores.endividamento_geral_pct}%
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-500 block">Margem Líquida</span>
                <span className="text-xs text-slate-400">Lucro Líquido / Receita Líquida</span>
              </div>
              <span className="text-lg font-bold font-mono text-emerald-700">
                {indicadores.margem_liquida_pct}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Últimos Lançamentos */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-800">Últimos Lançamentos Contábeis</h3>
            <p className="text-xs text-slate-500">Últimas movimentações escrituradas no Diário</p>
          </div>
          <button
            onClick={() => onNavigate("lancamentos")}
            className="text-xs text-blue-600 hover:text-blue-800 font-semibold"
          >
            Ver Todos →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase">
              <tr>
                <th className="py-2.5 px-3">Nº</th>
                <th className="py-2.5 px-3">Data</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Histórico</th>
                <th className="py-2.5 px-3 text-right">Valor Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {ultimos_lancamentos.map((l: any) => (
                <tr key={l.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-mono font-bold text-slate-700">#{l.numero}</td>
                  <td className="py-3 px-3 text-slate-600 font-mono text-xs">{l.data}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {l.tipo}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-800 font-medium">{l.historico}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                    R$ {l.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
