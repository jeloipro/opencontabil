import React, { useEffect, useState } from "react";
import { api, TransacaoOFX, ContaContabil } from "../services/api";
import { Landmark, Upload, Check, AlertCircle, RefreshCw, Zap, ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface Props {
  empresaId: number;
}

const SAMPLE_OFX = `<OFX>
  <BANKMSGSRSV1>
    <STMTTRNRS>
      <STMTRS>
        <BANKTRANLIST>
          <STMTTRN>
            <TRNTYPE>DEBIT
            <DTPOSTED>20260210120000
            <TRNAMT>-89.90
            <FITID>OFX-2026-001</FITID>
            <MEMO>TARIFA BANCARIA CESTA EMPRESARIAL</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>CREDIT
            <DTPOSTED>20260212120000
            <TRNAMT>4500.00
            <FITID>OFX-2026-002</FITID>
            <MEMO>PIX RECEBIDO CLIENTE TECH CORP</MEMO>
          </STMTTRN>
          <STMTTRN>
            <TRNTYPE>DEBIT
            <DTPOSTED>20260214120000
            <TRNAMT>-350.00
            <FITID>OFX-2026-003</FITID>
            <MEMO>PAGTO ENERGIA ELETRICA ENEL SP</MEMO>
          </STMTTRN>
        </BANKTRANLIST>
      </STMTRS>
    </STMTTRNRS>
  </BANKMSGSRSV1>
</OFX>`;

export const ConciliacaoPage: React.FC<Props> = ({ empresaId }) => {
  const [transacoes, setTransacoes] = useState<TransacaoOFX[]>([]);
  const [contasBancarias, setContasBancarias] = useState<ContaContabil[]>([]);
  const [contasContrapartida, setContasContrapartida] = useState<ContaContabil[]>([]);
  const [selectedContaBanco, setSelectedContaBanco] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [modalImportOpen, setModalImportOpen] = useState<boolean>(false);
  const [ofxText, setOfxText] = useState<string>(SAMPLE_OFX);
  const [importResult, setImportResult] = useState<any>(null);

  // Manual reconcile state
  const [reconcileModalTrn, setReconcileModalTrn] = useState<TransacaoOFX | null>(null);
  const [selectedContraId, setSelectedContraId] = useState<number>(0);
  const [historicoManual, setHistoricoManual] = useState<string>("");

  useEffect(() => {
    loadData();
  }, [empresaId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [trns, todasContas] = await Promise.all([
        api.getTransacoesOFX(empresaId),
        api.getPlanoContas(empresaId, "ANALITICA"),
      ]);
      setTransacoes(trns);

      // Bancos: contas que começam com 1.1.01
      const bancos = todasContas.filter((c) => c.codigo.startsWith("1.1.01"));
      setContasBancarias(bancos);
      if (bancos.length > 0 && selectedContaBanco === 0) {
        setSelectedContaBanco(bancos[0].id);
      }
      setContasContrapartida(todasContas);
      if (todasContas.length > 0) {
        setSelectedContraId(todasContas[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportOFX = async () => {
    try {
      const res = await api.importarOFXTexto(empresaId, selectedContaBanco, ofxText);
      setImportResult(res);
      loadData();
    } catch (err: any) {
      alert("Erro ao importar OFX: " + err.message);
    }
  };

  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reconcileModalTrn) return;

    try {
      await api.conciliarTransacao(reconcileModalTrn.id, {
        conta_contrapartida_id: selectedContraId,
        historico: historicoManual || `Conciliação de extrato bancário`,
      });
      setReconcileModalTrn(null);
      loadData();
    } catch (err: any) {
      alert("Erro ao conciliar: " + err.message);
    }
  };

  const pendentes = transacoes.filter((t) => t.status === "PENDENTE");
  const conciliadas = transacoes.filter((t) => t.status === "CONCILIADO");

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            <span>Conciliação Bancária Inteligente (OFX)</span>
          </h2>
          <p className="text-xs text-slate-500">
            Importe extratos OFX, aplique regras automáticas e gere partidas contábeis em 1 clique
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-semibold">Conta Bancária:</span>
            <select
              value={selectedContaBanco}
              onChange={(e) => setSelectedContaBanco(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold bg-slate-50"
            >
              {contasBancarias.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.descricao} (Cód. {b.codigo_reduzido})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setModalImportOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            <Upload className="w-4 h-4" />
            <span>Importar Extrato OFX</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Pendentes de Conciliação</span>
          <div className="text-2xl font-bold text-amber-600 mt-1 font-mono">{pendentes.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">Exigem conferência ou regra contábil</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Transações Conciliadas</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1 font-mono">{conciliadas.length}</div>
          <p className="text-xs text-slate-400 mt-0.5">Já convertidas em partidas dobradas</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase">Regras Inteligentes</span>
          <div className="text-2xl font-bold text-blue-600 mt-1 font-mono flex items-center gap-1.5">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" /> Ativas
          </div>
          <p className="text-xs text-slate-400 mt-0.5">Tarifas, PIX e rendimentos automáticos</p>
        </div>
      </div>

      {/* Transações List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Transações do Extrato ({transacoes.length})
          </h3>
          <span className="text-xs text-slate-500">
            Mostrando extratos importados para a conta corrente selecionada
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex justify-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : transacoes.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Landmark className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm">Nenhuma transação bancária importada ainda.</p>
            <button
              onClick={() => setModalImportOpen(true)}
              className="text-xs text-blue-600 font-semibold hover:underline"
            >
              Clique para importar um extrato OFX de teste
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">FITID</th>
                  <th className="py-3 px-4">Descrição do Extrato (MEMO)</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transacoes.map((t) => {
                  const isCredit = t.tipo === "CREDIT";
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-4 font-mono text-xs text-slate-600">
                        {new Date(t.data + "T00:00:00").toLocaleDateString("pt-BR")}
                      </td>
                      <td className="py-3 px-4">
                        {isCredit ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded w-max">
                            <ArrowDownLeft className="w-3.5 h-3.5" /> Entrada
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded w-max">
                            <ArrowUpRight className="w-3.5 h-3.5" /> Saída
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{t.fitid}</td>
                      <td className="py-3 px-4 font-medium text-slate-800">{t.memo}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={isCredit ? "text-emerald-700" : "text-slate-900"}>
                          {isCredit ? "+" : "-"} R${" "}
                          {t.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {t.status === "CONCILIADO" ? (
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                            <Check className="w-3 h-3" /> Conciliado
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                            Pendente
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {t.status === "PENDENTE" ? (
                          <button
                            onClick={() => {
                              setReconcileModalTrn(t);
                              setHistoricoManual(`Pagto/Recebimento ref: ${t.memo}`);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold transition"
                          >
                            Conciliar
                          </button>
                        ) : (
                          <span className="text-xs text-slate-400 font-mono">
                            Lçto #{t.lancamento_id}
                          </span>
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

      {/* Modal Importar OFX */}
      {modalImportOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Importação de Extrato Bancário OFX</h3>
            <p className="text-xs text-slate-500">
              Cole o conteúdo do arquivo OFX (padrão de qualquer banco brasileiro) ou utilize o modelo carregado abaixo:
            </p>

            <textarea
              rows={8}
              value={ofxText}
              onChange={(e) => setOfxText(e.target.value)}
              className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />

            {importResult && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 space-y-1">
                <p className="font-bold">Resultado do Processamento:</p>
                <p>Total encontradas no extrato: {importResult.total_encontradas}</p>
                <p>Importadas novas: {importResult.importadas}</p>
                <p>Duplicadas ignoradas: {importResult.duplicadas}</p>
                <p>Auto-conciliadas por regras: {importResult.auto_conciliadas}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setModalImportOpen(false);
                  setImportResult(null);
                }}
                className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={handleImportOFX}
                className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
              >
                Processar OFX
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Conciliar Manual */}
      {reconcileModalTrn && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Conciliar Transação Bancária</h3>
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1 font-mono">
              <p><strong>Data:</strong> {reconcileModalTrn.data}</p>
              <p><strong>Descrição:</strong> {reconcileModalTrn.memo}</p>
              <p>
                <strong>Valor:</strong> R${" "}
                {reconcileModalTrn.valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (
                {reconcileModalTrn.tipo})
              </p>
            </div>

            <form onSubmit={handleReconcileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Conta Contábil de Contrapartida
                </label>
                <select
                  value={selectedContraId}
                  onChange={(e) => setSelectedContraId(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {contasContrapartida.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.codigo_reduzido} - {c.codigo} | {c.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Histórico do Lançamento Contábil
                </label>
                <input
                  type="text"
                  required
                  value={historicoManual}
                  onChange={(e) => setHistoricoManual(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReconcileModalTrn(null)}
                  className="px-4 py-2 border rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700"
                >
                  Gerar Lançamento e Conciliar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
