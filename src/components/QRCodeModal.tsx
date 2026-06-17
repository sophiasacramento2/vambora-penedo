import { X, Copy, CheckCircle2 } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useState } from "react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  transactionId: string;
}

export default function QRCodeModal({ isOpen, onClose, amount, transactionId }: QRCodeModalProps) {
  const { updateTransactionStatus } = useAppStore();
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = () => {
    setLoading(true);
    setTimeout(() => {
      updateTransactionStatus(transactionId, 'CONFIRMED');
      setLoading(false);
      onClose();
    }, 1000); // simulate API call
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="bg-card w-full sm:w-[400px] rounded-3xl p-6 shadow-xl border border-border flex flex-col items-center text-center animate-in zoom-in-95">
        <div className="w-full flex justify-end mb-2">
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 size={32} />
        </div>

        <h2 className="text-2xl font-black text-foreground mb-1">Pague via Pix</h2>
        <p className="text-muted-foreground text-sm mb-6">Escaneie o QR Code ou copie a chave</p>

        <div className="bg-white p-4 rounded-2xl mb-6 shadow-sm border border-slate-100">
           {/* Mock QR Code representation */}
           <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=mock-pix-payload-${transactionId}`} alt="QR Code" className="w-40 h-40" />
        </div>

        <div className="w-full bg-muted rounded-xl p-3 flex items-center justify-between mb-8">
          <span className="text-xs text-muted-foreground truncate mr-2 font-mono">
            00020101021226870014br.gov.bcb.pix...
          </span>
          <button className="text-primary hover:text-primary/80">
            <Copy size={18} />
          </button>
        </div>

        <div className="w-full space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-foreground bg-muted/50 p-3 rounded-lg mb-4">
            <span>Valor a pagar:</span>
            <span>R$ {amount.toFixed(2)}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`btn-primary w-full py-4 text-base flex items-center justify-center gap-2 ${loading ? 'opacity-70' : ''}`}
          >
            {loading ? (
              <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
            ) : null}
            Já paguei o QR Code
          </button>
        </div>
      </div>
    </div>
  );
}
