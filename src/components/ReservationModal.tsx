import { useState } from "react";
import { X, Check, Minus, Plus } from "lucide-react";
import { Route, paymentLabels, paymentIcons } from "@/data/mockData";
import { useAppStore, Reservation } from "@/store/useAppStore";

interface Props {
  route: Route;
  onClose: () => void;
}

const today = new Date();
const nextDays = Array.from({ length: 7 }, (_, i) => {
  const d = new Date(today);
  d.setDate(today.getDate() + i);
  return d;
});
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

export default function ReservationModal({ route, onClose }: Props) {
  const { addReservation, user } = useAppStore();
  const [step, setStep] = useState<"form"|"done">("form");
  const [date, setDate] = useState(fmt(today));
  const [seats, setSeats] = useState(1);
  const [payMethod, setPayMethod] = useState(route.paymentMethods[0]);

  const selDay = nextDays.find((d) => fmt(d) === date) || today;
  const dow = selDay.getDay();
  const sched = dow === 0 ? route.schedules.sunday : dow === 6 ? route.schedules.saturday : route.schedules.weekdays;
  const [time, setTime] = useState(sched[0] || "06:00");
  const total = route.price * seats;

  const handleConfirm = () => {
    const res: Reservation = {
      id: `res-${Date.now()}`,
      routeId: route.id,
      routeName: route.name,
      date,
      time,
      seats,
      totalPrice: total,
      paymentMethod: payMethod,
      passengerName: user.name || "Passageiro",
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };
    addReservation(res);
    setStep("done");
  };

  if (step === "done") {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col items-center justify-center px-6 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mb-6">
          <Check size={40} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <h2 className="text-2xl font-black text-foreground mb-2">Reserva confirmada!</h2>
        <p className="text-muted-foreground text-sm mb-1">{route.name}</p>
        <p className="text-muted-foreground text-sm mb-6">
          {selDay.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })} às {time} · {seats} lugar{seats > 1 ? "es" : ""}
        </p>
        <div className="bg-muted rounded-xl p-4 w-full max-w-xs mb-8 text-left">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Total</span>
            <span className="font-black">R$ {total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Pagamento</span>
            <span className="font-semibold">{paymentLabels[payMethod as keyof typeof paymentLabels]}</span>
          </div>
        </div>
        <button onClick={onClose} className="btn-primary w-full max-w-xs">Fechar</button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-4 border-b border-border">
        <button onClick={onClose} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <X size={20} />
        </button>
        <h2 className="font-black text-foreground">Reservar assento</h2>
        <div className="w-10" />
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Linha */}
        <div>
          <p className="section-title">Linha</p>
          <div className="bg-card rounded-xl px-4 py-3">
            <p className="font-semibold text-sm text-foreground">{route.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{route.origin} → {route.destination}</p>
          </div>
        </div>

        {/* Data */}
        <div>
          <p className="section-title">Data</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {nextDays.map((d) => {
              const val = fmt(d);
              const sel = val === date;
              return (
                <button
                  key={val}
                  onClick={() => { setDate(val); setTime(sched[0] || "06:00"); }}
                  className={`shrink-0 flex flex-col items-center px-3 py-2.5 rounded-xl border transition-colors ${
                    sel ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground"
                  }`}
                >
                  <span className="text-[10px] font-medium capitalize">
                    {d.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </span>
                  <span className="text-base font-black leading-tight">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Horário */}
        <div>
          <p className="section-title">Horário</p>
          <div className="grid grid-cols-4 gap-2">
            {sched.map((t) => (
              <button
                key={t}
                onClick={() => setTime(t)}
                className={`py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                  time === t ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Lugares */}
        <div>
          <p className="section-title">Lugares</p>
          <div className="bg-card rounded-xl px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setSeats((s) => Math.max(1, s - 1))}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="text-2xl font-black text-foreground">{seats}</span>
            <button
              onClick={() => setSeats((s) => Math.min(8, s + 1))}
              className="w-9 h-9 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Pagamento */}
        <div>
          <p className="section-title">Pagamento</p>
          <div className="flex flex-col gap-2">
            {route.paymentMethods.map((pm) => (
              <button
                key={pm}
                onClick={() => setPayMethod(pm)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors ${
                  payMethod === pm ? "bg-foreground text-background border-foreground" : "bg-card border-border text-foreground"
                }`}
              >
                <span className="text-lg">{paymentIcons[pm]}</span>
                <span className="font-semibold text-sm">{paymentLabels[pm]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 pb-8 pt-4 border-t border-border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-muted-foreground">{seats} lugar{seats > 1 ? "es" : ""} × R$ {route.price.toFixed(2)}</span>
          <span className="text-xl font-black text-foreground">R$ {total.toFixed(2)}</span>
        </div>
        <button onClick={handleConfirm} className="btn-primary w-full">
          Confirmar reserva
        </button>
      </div>
    </div>
  );
}
