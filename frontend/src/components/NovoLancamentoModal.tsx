import React, { useState, useEffect } from "react";
import { ContaContabil, CentroCusto, api } from "../services/api";
import { X, Plus, Trash2, Check, AlertTriangle } from "lucide-react";

interface Props {
  empresaId: number;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface RowState {
  conta_id: number;
  tipo: "DEBITO" | "CREDITO";
  valor: string;
  centro_custo_id?: number;
  complemento?: string;
}

export const NovoLancamentoModal: React.FC<Props> = ({
  empresaId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [data, setData] = useState<string>(new Date().toISOString().split("T")[0]);
  const [tipo, setTipo] = useState<string>("ORDINARIO");
  const [historico, setHistorico] = useState<string>("");
  const [documento, setDocumento] = useState<string>("");
  const [contas, setContas] = useState<ContaContabil[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [partidas, setPartidas] = useState<RowState[]>([
    { conta_id: 0, tipo: "DEBITO", valor: "", complemento: "" },
    { conta_id: 0, tipo: "CREDITO", valor: "", complemento: "" },
  ]);

  useEffect(() => {
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen, empresaId]);

  const loadDependencies = async () => {
    try {
      const [contasList, ccList] = await Promise.all([
        api.getPlanoContas(empresaId, "ANALITICA"),
        api.getCentrosCusto(empresaId),
      ]);
      setContas(contasList);
      setCentrosCusto(ccList);
      if (contasList.length >= 2) {
        setPartidas([
          { conta_id: contasList[0].id, tipo: "DEBITO", valor: "", complemento: "" },
          { conta_id: contasList[1].id, tipo: "CREDITO", valor: "", complemento: "" },
        ]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isOpen) return null;

  const totalDebito = partidas
    .filter((p) => p.tipo === "DEBITO")
    .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

  const totalCredito = partidas
    .filter((p) => p.tipo === "CREDITO")
    .reduce((acc, curr) => acc + (parseFloat(curr.valor) || 0), 0);

  const diferenca = Math.abs(totalDebito - totalCredito);
  const isBalanceado = diferenca < 0.009 && totalDebito > 0;

  const handleAddRow = () => {
    setPartidas([
      ...partidas,
      {
        conta_id: contas[0]?.id || 0,
        tipo: totalDebito > totalCredito ? "CREDITO" : "DEBITO",
        valor: diferenca > 0 ? diferenca.toFixed(2) : "",
        complemento: "",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (partidas.length <= 2) return;
    setPartidas(partidas.filter((_, i) => i !== index));
  };

  const handleUpdateRow = (index: number, field: keyof RowState, value: any) => {
    const updated = [...partidas];
    updated[index] = { ...updated[index], [field]: value };
    setPartidas(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!isBalanceado) {
      setErrorMsg("O lançamento contábil deve estar rigorosamente balanceado (Débitos = Créditos)!");
      return;
    }
    if (!historico.trim()) {
      setErrorMsg("O histórico contábil é obrigatório.");
      return;
    }

    setLoading(true);
    try {
      await api.createLancamento(empresaId, {
        data,
        tipo,
        historico,
        documento: documento || null,
        partidas: partidas.map((p) => ({
          conta_id: Number(p.conta_id),
          tipo: p.tipo,
          valor: parseFloat(p.valor),
          centro_custo_id: p.centro_custo_id ? Number(p.centro_custo_id) : null,
          complemento: p.complemento || null,
        })),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Erro ao salvar lançamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Novo Lançamento Contábil (Partidas Dobradas)
            </h2>
            <p className="text-xs text-slate-500">
              Escrituração digital em conformidade com as normas do CFC e layout SPED
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Dados Gerais do Lançamento */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Data do Lançamento
              </label>
              <input
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Tipo de Partida
              </label>
              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="ORDINARIO">Ordinário (Rotina Diária)</option>
                <option value="ABERTURA">Termo de Abertura / Saldo Inicial</option>
                <option value="APURACAO">Apuração de Resultado (Encerramento)</option>
                <option value="ESTORNO">Estorno / Regularização</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Nº Documento / NF
              </label>
              <input
                type="text"
                placeholder="Ex: NF-1045, REC-02"
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Histórico Contábil
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Valor ref. pagamento de fatura telefonia celular s/ NF 12345"
              value={historico}
              onChange={(e) => setHistorico(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Linhas de Partidas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-800">Partidas (Débitos e Créditos)</h3>
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold"
              >
                <Plus className="w-4 h-4" />
                Adicionar Partida
              </button>
            </div>

            <div className="space-y-2 border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              {partidas.map((row, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200 shadow-2xs">
                  {/* Tipo D/C */}
                  <select
                    value={row.tipo}
                    onChange={(e) => handleUpdateRow(idx, "tipo", e.target.value)}
                    className={`w-28 px-2 py-1.5 border rounded text-xs font-bold ${
                      row.tipo === "DEBITO"
                        ? "bg-blue-50 text-blue-700 border-blue-300"
                        : "bg-emerald-50 text-emerald-700 border-emerald-300"
                    }`}
                  >
                    <option value="DEBITO">DÉBITO (D)</option>
                    <option value="CREDITO">CRÉDITO (C)</option>
                  </select>

                  {/* Conta Contábil */}
                  <select
                    value={row.conta_id}
                    onChange={(e) => handleUpdateRow(idx, "conta_id", Number(e.target.value))}
                    className="flex-1 px-2.5 py-1.5 border border-slate-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    {contas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.codigo_reduzido} - {c.codigo} | {c.descricao} ({c.natureza[0]})
                      </option>
                    ))}
                  </select>

                  {/* Valor */}
                  <div className="relative w-36">
                    <span className="absolute left-2.5 top-1.5 text-xs text-slate-400 font-medium">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="0,00"
                      value={row.valor}
                      onChange={(e) => handleUpdateRow(idx, "valor", e.target.value)}
                      className="w-full pl-8 pr-2 py-1.5 border border-slate-300 rounded text-xs text-right font-mono font-semibold focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Centro de Custo */}
                  <select
                    value={row.centro_custo_id || ""}
                    onChange={(e) => handleUpdateRow(idx, "centro_custo_id", e.target.value ? Number(e.target.value) : undefined)}
                    className="w-36 px-2 py-1.5 border border-slate-300 rounded text-xs text-slate-600 focus:outline-none"
                  >
                    <option value="">Centro Custo (Opc)</option>
                    {centrosCusto.map((cc) => (
                      <option key={cc.id} value={cc.id}>
                        {cc.codigo} - {cc.nome}
                      </option>
                    ))}
                  </select>

                  {/* Delete button */}
                  {partidas.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="text-slate-400 hover:text-red-500 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Painel de Fechamento de Partidas */}
          <div className="bg-slate-100 p-4 rounded-xl flex items-center justify-between border border-slate-200">
            <div className="flex items-center gap-6 text-sm">
              <div>
                <span className="text-slate-500 block text-xs">Total a Débito (D)</span>
                <span className="font-mono font-bold text-blue-700 text-base">
                  R$ {totalDebito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-l border-slate-300 pl-6">
                <span className="text-slate-500 block text-xs">Total a Crédito (C)</span>
                <span className="font-mono font-bold text-emerald-700 text-base">
                  R$ {totalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-l border-slate-300 pl-6">
                <span className="text-slate-500 block text-xs">Diferença</span>
                <span
                  className={`font-mono font-bold text-base ${
                    diferenca === 0 ? "text-slate-700" : "text-red-600"
                  }`}
                >
                  R$ {diferenca.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isBalanceado ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Check className="w-4 h-4" /> Partidas Fechadas
                </div>
              ) : (
                <div className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-200">
                  Desbalanceado
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !isBalanceado}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-sm transition"
            >
              {loading ? "Gravando Lançamento..." : "Gravar Lançamento"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
