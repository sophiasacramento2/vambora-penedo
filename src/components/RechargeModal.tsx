import { useState } from "react";
import { X } from "lucide-react";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amount: number) => void;
}

const PRESETS = [20, 25, 30, 50];

export default function RechargeModal({ isOpen, onClose, onSuccess }: RechargeModalProps) {
  const [amount, setAmount] = useState<string>("");

  if (!isOpen) return null;

  const numAmount = parseFloat(amount.replace(",", "."));
  const isValid = !isNaN(numAmount) && numAmount >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full sm:w-[400px] rounded-t-3xl sm:rounded-2xl p-6 shadow-xl border border-border animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-foreground">Recarregar</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
            <X size={18} />
          </button>
        </div>

        <p className="text-sm text-muted-foreground mb-4">Escolha um valor ou digite (mín. R$ 5)</p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {PRESETS.map((val) => (
            <button
              key={val}
              onClick={() => setAmount(val.toString())}
              className={`py-2 rounded-xl text-sm font-bold border transition-colors ${
                numAmount === val
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted text-foreground border-transparent hover:border-primary/50"
              }`}
            >
              R$ {val}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <label className="block text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Valor (R$)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Ex: 50.00"
            className="input-uber"
            min="5"
            step="0.01"
          />
        </div>

        <button
          onClick={() => onSuccess(numAmount)}
          disabled={!isValid}
          className={`btn-primary w-full py-4 text-base ${!isValid ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Gerar Pix
        </button>
      </div>
    </div>
  );
}
