import { useNavigate } from "react-router-dom";
import { ArrowLeft, Ticket, X, Bus, Ship, Truck } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { routes } from "@/data/mockData";
import BottomNav from "@/components/BottomNav";

const typeIcon = { bus: Bus, van: Truck, boat: Ship };

const ReservationsPage = () => {
  const navigate = useNavigate();
  const { reservations, cancelReservation } = useAppStore();

  const sorted = [...reservations].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="page-container bg-background">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mb-6">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-2xl font-black text-foreground tracking-tight mb-6">Minhas reservas</h1>

      {sorted.length === 0 ? (
        <div className="text-center py-16">
          <Ticket size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground font-medium">Nenhuma reserva ainda</p>
          <button onClick={() => navigate("/home")} className="btn-primary mt-6 max-w-xs mx-auto">
            Explorar linhas
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sorted.map((res) => {
            const route = routes.find((r) => r.id === res.routeId);
            const Icon = route ? typeIcon[route.type] : Ticket;
            const isCancelled = res.status === "cancelled";

            return (
              <div
                key={res.id}
                className={`bg-card rounded-xl overflow-hidden border border-border ${isCancelled ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <Icon size={18} className="text-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm truncate">{res.routeName}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(res.date + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às {res.time} · {res.seats} lugar{res.seats > 1 ? "es" : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-foreground text-sm">R$ {res.totalPrice.toFixed(2)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isCancelled ? "bg-muted text-muted-foreground" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                    }`}>
                      {isCancelled ? "Cancelada" : "Confirmada"}
                    </span>
                  </div>
                </div>
                {!isCancelled && (
                  <div className="border-t border-border px-4 py-2.5">
                    <button
                      onClick={() => cancelReservation(res.id)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-destructive active:opacity-60 transition-opacity"
                    >
                      <X size={13} /> Cancelar reserva
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default ReservationsPage;
