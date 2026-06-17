import { X, ArrowDownLeft, ArrowUpRight, Clock } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface StatementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StatementModal({ isOpen, onClose }: StatementModalProps) {
  const { walletTransactions } = useAppStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full sm:w-[450px] h-[85vh] sm:h-[600px] rounded-t-3xl sm:rounded-2xl shadow-xl border border-border flex flex-col animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <h2 className="text-xl font-black text-foreground">Extrato</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {walletTransactions.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
              <Clock size={48} className="mb-4 opacity-20" />
              <p>Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {walletTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.status === 'CONFIRMED' ? 'bg-primary/10 text-primary' : 'bg-amber-500/10 text-amber-500'
                    }`}>
                      {tx.type === 'recharge' ? <ArrowDownLeft size={18} /> : <ArrowUpRight size={18} />}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">
                        {tx.type === 'recharge' ? 'Recarga via Pix' : 'Pagamento'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        {new Date(tx.createdAt).toLocaleDateString('pt-BR')} 
                        {tx.status === 'PENDING' && <span className="text-amber-500">• Pendente</span>}
                        {tx.status === 'FAILED' && <span className="text-destructive">• Falhou</span>}
                      </p>
                    </div>
                  </div>
                  <div className={`font-black text-sm tabular-nums ${
                    tx.status === 'CONFIRMED' && tx.type === 'recharge' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {tx.type === 'recharge' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
