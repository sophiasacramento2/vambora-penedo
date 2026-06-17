import { Plus, Bus, Ship, Truck, History, ArrowUpRight } from "lucide-react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { walletData } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";
import RechargeModal from "@/components/RechargeModal";
import QRCodeModal from "@/components/QRCodeModal";
import StatementModal from "@/components/StatementModal";

const typeIcon  = { bus: Bus,   van: Truck, boat: Ship };
const iconBgClass = { bus: "icon-bg-bus", van: "icon-bg-van", boat: "icon-bg-boat" };
const iconColorClass = { bus: "transport-icon-bus", van: "transport-icon-van", boat: "transport-icon-boat" };

const WalletPage = () => {
  const { user, createPendingRecharge, walletTransactions } = useAppStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isQRCodeOpen, setIsQRCodeOpen] = useState(false);
  const [isStatementOpen, setIsStatementOpen] = useState(false);
  
  const [currentAmount, setCurrentAmount] = useState(0);
  const [currentTxId, setCurrentTxId] = useState("");

  useEffect(() => {
    if (searchParams.get("recharge") === "true") {
      setIsRechargeOpen(true);
      searchParams.delete("recharge");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const recentTrips = walletTransactions.filter(t => t.type === 'payment').slice(0, 5);

  const handleRechargeSuccess = (amount: number) => {
    const txId = createPendingRecharge(amount);
    setCurrentAmount(amount);
    setCurrentTxId(txId);
    setIsRechargeOpen(false);
    setIsQRCodeOpen(true);
  };

  return (
  <div className="page-container bg-background">
    <h1 className="text-2xl font-black text-foreground tracking-tight mb-6">Carteira</h1>

    {/* Balance card */}
    <div className="bg-primary rounded-2xl p-6 mb-6">
      <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-2">Saldo disponível</p>
      <p className="text-4xl font-black text-white tracking-tight">
        R$ {(user.wallet_balance || 0).toFixed(2)}
      </p>
      <p className="text-white/40 text-xs mt-2 font-mono">{walletData.cardNumber}</p>
    </div>

    {/* Actions */}
    <div className="grid grid-cols-2 gap-3 mb-8">
      <button 
        onClick={() => setIsRechargeOpen(true)}
        className="btn-primary flex items-center justify-center gap-2 text-sm py-3.5"
      >
        <Plus size={17} /> Recarregar
      </button>
      <button 
        onClick={() => setIsStatementOpen(true)}
        className="btn-secondary flex items-center justify-center gap-2 text-sm py-3.5"
      >
        <History size={17} /> Extrato
      </button>
    </div>

    {/* Trips */}
    <p className="section-title">Últimas viagens</p>
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      {recentTrips.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground text-sm">
          Nenhuma viagem recente paga com a carteira.
        </div>
      ) : (
        recentTrips.map((trip, i) => {
          const Icon = typeIcon[trip.routeType || "bus"] || Bus;
          return (
            <div key={trip.id} className={`flex items-center gap-3 p-4 ${i > 0 ? "border-t border-border" : ""}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBgClass[trip.routeType || "bus"] || iconBgClass.bus}`}>
                <Icon size={18} className={iconColorClass[trip.routeType || "bus"] || iconColorClass.bus} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm truncate">{trip.routeName || "Viagem"}</p>
                <p className="text-xs text-muted-foreground">{new Date(trip.createdAt).toLocaleDateString("pt-BR")}</p>
              </div>
              <span className="font-black text-foreground text-sm tabular-nums">
                −R$ {trip.amount.toFixed(2)}
              </span>
            </div>
          );
        })
      )}
    </div>

    <BottomNav />
    
    <RechargeModal 
      isOpen={isRechargeOpen} 
      onClose={() => setIsRechargeOpen(false)} 
      onSuccess={handleRechargeSuccess} 
    />
    
    <QRCodeModal 
      isOpen={isQRCodeOpen} 
      onClose={() => setIsQRCodeOpen(false)} 
      amount={currentAmount}
      transactionId={currentTxId}
    />
    
    <StatementModal 
      isOpen={isStatementOpen} 
      onClose={() => setIsStatementOpen(false)} 
    />
  </div>
  );
};

export default WalletPage;
