import React, { useEffect, useState } from "react";
import { api, Lancamento } from "../services/api";
import { Plus, Trash2, Search, Filter, RefreshCw, FileText } from "lucide-react";

interface Props {
  empresaId: number;
  onOpenNovoLancamento: () => void;
}

export const LancamentosPage: React.FC<Props> = ({ empresaId, onOpenNovoLancamento }) => {
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filtroTexto, setFiltroTexto] = useState<string>("");
  const [selectedLancamento, setSelectedLancamento] = useState<Lancamento | null>(null);

  useEffect(() => {
    loadLancamentos();
  }, [empresaId]);

  const loadLancamentos = async () => {
    setLoading(true);
    try {
      const data = await api.getLancamentos(empresaId);
      setLancamentos(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Confirma a exclusão deste lançamento contábil?")) return;
    try {
      await api.deleteLancamento(id);
      loadLancamentos();
      setSelectedLancamento(null);
    } catch (err) {
      alert("Erro ao excluir lançamento.");
    }
  };

  const filtrados = lancamentos.filter(
    (l) =>
      l.historico.toLowerCase().includes(filtroTexto.toLowerCase()) ||
      l.numero.toString().includes(filtroTexto) ||
      (l.documento && l.documento.toLowerCase().includes(filtroTexto.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Lançamentos Contábeis (Partidas Dobradas)</h2>
          <p className="text-xs text-slate-500">
            Escrituração cronológica com histórico e contrapartidas
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por histórico, Nº..."
              value={filtroTexto}
              onChange={(e) => setFiltroTexto(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={onOpenNovoLancamento}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lançamento</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : filtrados.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FileText className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm">Nenhum lançamento encontrado para os critérios pesquisados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Nº</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Documento</th>
                  <th className="py-3 px-4">Histórico Contábil</th>
                  <th className="py-3 px-4 text-center">Partidas</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtrados.map((l) => {
                  const total = l.partidas
                    .filter((p) => p.tipo === "DEBITO")
                    .reduce((acc, curr) => acc + curr.valor, 0);

                  return (
                    <React.Fragment key={l.id}>
                      <tr
                        onClick={() => setSelectedLancamento(selectedLancamento?.id === l.id ? null : l)}
                        className={`cursor-pointer transition-colors ${
                          selectedLancamento?.id === l.id ? "bg-blue-50/60" : "hover:bg-slate-50/80"
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">#{l.numero}</td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-600">
                          {new Date(l.data + "T00:00:00").toLocaleDateString("pt-BR")}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                            {l.tipo}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-slate-500">
                          {l.documento || "—"}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800 max-w-md truncate">
                          {l.historico}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full font-mono font-semibold text-slate-600">
                            {l.partidas.length} linhas
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(l.id);
                            }}
                            className="text-slate-400 hover:text-red-500 p-1"
                            title="Excluir Lançamento"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Partidas Expanded view */}
                      {selectedLancamento?.id === l.id && (
                        <tr className="bg-slate-50/80">
                          <td colSpan={8} className="p-4 border-y border-slate-200">
                            <div className="bg-white rounded-lg p-3 border border-slate-200 space-y-2">
                              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                                Detalhamento das Partidas Dobradas (Lançamento #{l.numero})
                              </div>
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="text-slate-400 uppercase border-b border-slate-100 pb-1">
                                    <th className="text-left py-1">Natureza</th>
                                    <th className="text-left py-1">Código</th>
                                    <th className="text-left py-1">Conta Contábil</th>
                                    <th className="text-left py-1">Complemento</th>
                                    <th className="text-right py-1">Débito (D)</th>
                                    <th className="text-right py-1">Crédito (C)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-mono">
                                  {l.partidas.map((p, pIdx) => (
                                    <tr key={pIdx} className="py-1.5">
                                      <td className="py-1">
                                        <span
                                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                            p.tipo === "DEBITO"
                                              ? "bg-blue-100 text-blue-700"
                                              : "bg-emerald-100 text-emerald-700"
                                          }`}
                                        >
                                          {p.tipo}
                                        </span>
                                      </td>
                                      <td className="py-1 text-slate-600">{p.conta_codigo}</td>
                                      <td className="py-1 font-sans text-slate-800 font-medium">
                                        {p.conta_descricao}
                                      </td>
                                      <td className="py-1 font-sans text-slate-400 italic">
                                        {p.complemento || "—"}
                                      </td>
                                      <td className="py-1 text-right text-blue-700 font-semibold">
                                        {p.tipo === "DEBITO"
                                          ? `R$ ${p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                          : "—"}
                                      </td>
                                      <td className="py-1 text-right text-emerald-700 font-semibold">
                                        {p.tipo === "CREDITO"
                                          ? `R$ ${p.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                                          : "—"}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
