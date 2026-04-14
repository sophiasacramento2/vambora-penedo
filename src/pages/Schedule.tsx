import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, Bus, Ship, Truck, Star, Calendar, CreditCard, Ticket, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { routes, getNextDepartures, minutesUntilNext, paymentLabels, paymentIcons, getScheduleForDay } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";
import { useFlowTracking } from "@/hooks/useFlowTracking";
import ReservationModal from "@/components/ReservationModal";

const dayTabs = [
  { key: "weekdays", label: "Dias úteis" },
  { key: "saturday", label: "Sábado" },
  { key: "sunday", label: "Dom/Feriado" },
] as const;

const typeIcon = { bus: Bus, van: Truck, boat: Ship };

const Schedule = () => {
  const { routeId } = useParams<{ routeId: string }>();
  const navigate = useNavigate();
  const [activeDay, setActiveDay] = useState<"weekdays" | "saturday" | "sunday">("weekdays");
  const [showReservation, setShowReservation] = useState(false);
  const { savedRouteIds, toggleSaveRoute } = useAppStore();
  const { trackRouteView } = useFlowTracking();
  useEffect(() => { if (route) trackRouteView(route.id, route.type, route.destination); }, [route?.id]);

  const route = routes.find((r) => r.id === routeId);
  if (!route) {
    return (
      <div className="page-container bg-background flex flex-col items-center justify-center">
        <p className="text-muted-foreground">Linha não encontrada.</p>
        <button onClick={() => navigate(-1)} className="btn-primary mt-4 max-w-xs">Voltar</button>
        <BottomNav />
      </div>
    );
  }

  const Icon = typeIcon[route.type];
  const isSaved = savedRouteIds.includes(route.id);
  const times = route.schedules[activeDay];
  const nextDeps = getNextDepartures(route, 3);
  const minsUntil = minutesUntilNext(route);

  const now = new Date();
  const curTime = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;

  return (
    <div className="page-container bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform">
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => toggleSaveRoute(route.id)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted active:bg-accent transition-colors"
        >
          <Star size={15} className={isSaved ? "fill-amber-400 text-amber-400" : "text-muted-foreground"} />
          <span className="text-xs font-semibold">{isSaved ? "Salvo" : "Salvar"}</span>
        </button>
      </div>

      {/* Route Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
          <Icon size={22} className="text-background" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-foreground tracking-tight truncate">{route.name}</h1>
          <p className="text-xs text-muted-foreground">{route.origin} → {route.destination}</p>
        </div>
      </div>

      {/* Info pills */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <div className="flex items-center gap-1.5 bg-muted px-3 py-2 rounded-full text-xs font-semibold">
          <Clock size={13} /> {route.duration}
        </div>
        <div className="bg-foreground text-background px-3 py-2 rounded-full text-xs font-bold">
          R$ {route.price.toFixed(2)}
        </div>
        {route.frequency && (
          <div className="bg-muted px-3 py-2 rounded-full text-xs text-muted-foreground font-medium">
            {route.frequency}
          </div>
        )}
      </div>

      {/* Próximas partidas (RF4.3) */}
      {nextDeps.length > 0 ? (
        <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-5">
          <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock size={11} /> Próximas partidas hoje
          </p>
          <div className="flex gap-2">
            {nextDeps.map((t, i) => {
              const [h, m] = t.split(":").map(Number);
              const diff = h * 60 + m - (now.getHours() * 60 + now.getMinutes());
              return (
                <div key={t} className="flex-1 flex flex-col items-center bg-white dark:bg-emerald-900/40 rounded-lg py-2.5 px-1">
                  <span className="font-black text-emerald-800 dark:text-emerald-300 text-sm">{t}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-500 mt-0.5">
                    {i === 0 && diff <= 0 ? "Agora" : `${diff} min`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-muted rounded-xl p-4 mb-5 text-center">
          <p className="text-sm text-muted-foreground">Sem mais partidas hoje para esta linha.</p>
        </div>
      )}

      {/* Formas de pagamento (RF3.2) */}
      <div className="mb-5">
        <p className="section-title flex items-center gap-1.5">
          <CreditCard size={11} /> Formas de pagamento
        </p>
        <div className="flex gap-2 flex-wrap">
          {route.paymentMethods.map((pm) => (
            <div key={pm} className="flex items-center gap-1.5 bg-card border border-border px-3 py-2 rounded-full text-xs font-semibold">
              <span>{paymentIcons[pm]}</span>
              <span>{paymentLabels[pm]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Paradas */}
      {route.stops && (
        <div className="mb-5">
          <p className="section-title">Paradas</p>
          <div className="bg-card rounded-xl p-4">
            {route.stops.map((stop, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-2.5 h-2.5 rounded-full ${i === 0 || i === route.stops!.length - 1 ? "bg-foreground" : "bg-border"}`} />
                  {i < route.stops!.length - 1 && <div className="w-0.5 h-5 bg-border" />}
                </div>
                <span className={`text-sm py-1 ${i === 0 || i === route.stops!.length - 1 ? "font-bold text-foreground" : "text-muted-foreground"}`}>
                  {stop}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Day Tabs */}
      <div className="flex gap-1 mb-4 p-1 rounded-lg bg-muted">
        {dayTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveDay(tab.key)}
            className={`flex-1 py-2.5 rounded-md text-xs font-semibold transition-all duration-150 ${
              activeDay === tab.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grade de horários */}
      <p className="section-title flex items-center gap-1.5">
        <Calendar size={11} /> Horários de saída
      </p>
      <div className="bg-card rounded-xl p-4 mb-6">
        {times.length > 0 ? (
          <div className="grid grid-cols-4 gap-2">
            {times.map((time) => {
              const isPast = activeDay === "weekdays" && time < curTime;
              const isNext = nextDeps[0] === time && activeDay === "weekdays";
              return (
                <div
                  key={time}
                  className={`text-center py-2.5 rounded-lg text-sm font-semibold ${
                    isNext ? "bg-emerald-500 text-white" :
                    isPast ? "bg-muted/40 text-muted-foreground/40" :
                    "bg-muted text-foreground"
                  }`}
                >
                  {time}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-center py-6 text-sm">Sem horários neste dia</p>
        )}
      </div>

      {/* Reserva (RF3.3) */}
      {route.supportsReservation && (
        <button
          onClick={() => setShowReservation(true)}
          className="btn-primary flex items-center justify-center gap-2 mb-4"
        >
          <Ticket size={18} /> Reservar assento
        </button>
      )}

      <BottomNav />
      {showReservation && <ReservationModal route={route} onClose={() => setShowReservation(false)} />}
    </div>
  );
};

export default Schedule;
