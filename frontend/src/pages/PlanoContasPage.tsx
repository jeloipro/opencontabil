import React, { useEffect, useState } from "react";
import { api, ContaContabil } from "../services/api";
import { Plus, Search, Layers, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface Props {
  empresaId: number;
}

export const PlanoContasPage: React.FC<Props> = ({ empresaId }) => {
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroTexto, setFiltroTexto] = useState<string>("");
  const [filtroGrupo, setFiltroGrupo] = useState<string>("TODOS");
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // New account form state
  const [codigo, setCodigo] = useState("");
  const [codigoReduzido, setCodigoReduzido] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tipo, setTipo] = useState<"ANALITICA" | "SINTETICA">("ANALITICA");
  const [natureza, setNatureza] = useState<"DEVEDORA" | "CREDORA">("DEVEDORA");
  const [grupo, setGrupo] = useState("ATIVO");
  const [codigoRfb, setCodigoRfb] = useState("");

  useEffect(() => {
    loadContas();
  }, [empresaId]);

  const loadContas = async () => {
    setLoading(true);
    try {
      const data = await api.getPlanoContas(empresaId);
      setContas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createConta(empresaId, {
        codigo,
        codigo_reduzido: Number(codigoReduzido),
        descricao,
        tipo,
        natureza,
        grupo,
        nivel: codigo.split(".").length,
        codigo_referencial_rfb: codigoRfb || undefined,
        ativa: true,
      });
      setModalOpen(false);
      loadContas();
    } catch (err: any) {
      alert(err.message || "Erro ao criar conta.");
    }
  };

  const filtradas = contas.filter((c) => {
    const matchesText =
      c.descricao.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      c.codigo.includes(filtroTexto) ||
      c.codigo_reduzido.toString().includes(filtroTexto);
    const matchesGrupo = filtroGrupo === "TODOS" || c.grupo === filtroGrupo;
    return matchesText && matchesGrupo;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Plano de Contas Referencial (RFB / SPED)</h2>
          <p className="text-xs text-slate-500">
            Estrutura contábil padronizada com amarração para Escrituração Contábil Digital
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Grupo Filter */}
          <select
            value={filtroGrupo}
            onChange={(e) => setFiltroGrupo(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold border border-slate-300 rounded-lg bg-slate-50 focus:outline-none"
          >
            <option value="TODOS">Todos os Grupos</option>
            <option value="ATIVO">1 - Ativo</option>
            <option value="PASSIVO">2 - Passivo</option>
            <option value="PATRIMONIO_LIQUIDO">3 - Patrimônio Líquido</option>
            <option value="DESPESAS">4 - Despesas & Custos</option>
            <option value="RECEITAS">5 - Receitas</option>
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Código, descrição..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Conta</span>
          </button>
        </div>
      </div>

      {/* Tabela de Contas */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Classificação</th>
                  <th className="py-3 px-4">Cód. Reduzido</th>
                  <th className="py-3 px-4">Descrição da Conta</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Natureza</th>
                  <th className="py-3 px-4">Mapeamento SPED (RFB)</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-xs">
                {filtradas.map((c) => {
                  const isSintetica = c.tipo === "SINTETICA";
                  const indent = (c.nivel - 1) * 16;

                  return (
                    <tr
                      key={c.id}
                      className={isSintetica ? "bg-slate-50/60 font-semibold" : "hover:bg-slate-50/50"}
                    >
                      <td className="py-2.5 px-4 text-slate-700">{c.codigo}</td>
                      <td className="py-2.5 px-4 text-blue-700 font-bold">
                        {c.tipo === "ANALITICA" ? c.codigo_reduzido : "—"}
                      </td>
                      <td className="py-2.5 px-4 font-sans text-slate-900">
                        <span style={{ paddingLeft: `${indent}px` }}>
                          {isSintetica ? <strong>{c.descricao}</strong> : c.descricao}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isSintetica
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {c.tipo}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`font-semibold ${
                            c.natureza === "DEVEDORA" ? "text-blue-600" : "text-emerald-600"
                          }`}
                        >
                          {c.natureza}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">
                        {c.codigo_referencial_rfb ? (
                          <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700 border border-slate-200">
                            {c.codigo_referencial_rfb}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {c.ativa ? (
                          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" title="Ativa" />
                        ) : (
                          <span className="inline-block w-2 h-2 rounded-full bg-slate-300" title="Inativa" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Nova Conta */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Cadastrar Nova Conta Contábil</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Código Estrutural</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 1.1.01.005"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Cód. Reduzido</label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 95"
                    value={codigoReduzido}
                    onChange={(e) => setCodigoReduzido(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Descrição</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banco Santander C/C"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo</label>
                  <select
                    value={tipo}
                    onChange={(e: any) => setTipo(e.target.value)}
                    className="w-full px-2 py-2 border rounded-lg text-xs"
                  >
                    <option value="ANALITICA">Analítica</option>
                    <option value="SINTETICA">Sintética</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Natureza</label>
                  <select
                    value={natureza}
                    onChange={(e: any) => setNatureza(e.target.value)}
                    className="w-full px-2 py-2 border rounded-lg text-xs"
                  >
                    <option value="DEVEDORA">Devedora</option>
                    <option value="CREDORA">Credora</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Grupo</label>
                  <select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    className="w-full px-2 py-2 border rounded-lg text-xs"
                  >
                    <option value="ATIVO">Ativo</option>
                    <option value="PASSIVO">Passivo</option>
                    <option value="PATRIMONIO_LIQUIDO">Patrimônio Líquido</option>
                    <option value="CUSTOS">Custos</option>
                    <option value="DESPESAS">Despesas</option>
                    <option value="RECEITAS">Receitas</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mapeamento RFB (SPED ECD)
                </label>
                <input
                  type="text"
                  placeholder="Ex: 1.01.01.02.03"
                  value={codigoRfb}
                  onChange={(e) => setCodigoRfb(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Salvar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

