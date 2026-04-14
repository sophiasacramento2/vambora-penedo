import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Bell, Bus, Ship, Truck, ChevronRight, MapPin, Clock, Star } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { routes, alerts, minutesUntilNext, getNextDepartures } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";

const typeIcon  = { bus: Bus,   van: Truck, boat: Ship  };
const typeLabel = { bus: "Ônibus", van: "Vans", boat: "Barcos" };

const iconColorClass  = { bus: "transport-icon-bus",  van: "transport-icon-van",  boat: "transport-icon-boat"  };
const iconBgClass     = { bus: "icon-bg-bus",          van: "icon-bg-van",          boat: "icon-bg-boat"          };

const HomePage = () => {
  const navigate = useNavigate();
  const { savedRouteIds, toggleSaveRoute, alertsRead } = useAppStore();
  const [search, setSearch] = useState("");
  const [now, setNow]       = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(t);
  }, []);

  const unreadCount   = alerts.filter((a) => !alertsRead.includes(a.id)).length;
  const filteredRoutes = search.trim()
    ? routes.filter((r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.origin.toLowerCase().includes(search.toLowerCase()) ||
        r.destination.toLowerCase().includes(search.toLowerCase())
      )
    : [];
  const savedRoutes = routes.filter((r) => savedRouteIds.includes(r.id));

  const RouteRow = ({ route, index }: { route: (typeof routes)[0]; index: number }) => {
    const Icon    = typeIcon[route.type];
    const mins    = minutesUntilNext(route);
    const isSaved = savedRouteIds.includes(route.id);

    return (
      <div className={`flex items-center gap-1 ${index > 0 ? "border-t border-border" : ""}`}>
        <button
          className="flex-1 flex items-center gap-3 p-4 text-left active:bg-muted transition-colors"
          onClick={() => navigate(`/horarios/${route.id}`)}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${iconBgClass[route.type]}`}>
            <Icon size={18} className={iconColorClass[route.type]} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-foreground text-sm truncate">{route.name}</p>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-xs text-muted-foreground">{route.duration}</span>
              <span className="text-xs text-muted-foreground">·</span>
              <span className="text-xs font-bold text-foreground">R$ {route.price.toFixed(2)}</span>
              {mins !== null && mins <= 30 && (
                <>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-brand-teal">
                    <Clock size={10} />
                    {mins === 0 ? "Agora" : `${mins} min`}
                  </span>
                </>
              )}
            </div>
          </div>
          <ChevronRight size={16} className="text-muted-foreground shrink-0" />
        </button>
        <button
          onClick={() => toggleSaveRoute(route.id)}
          className="pr-4 py-4 active:scale-90 transition-transform"
          aria-label={isSaved ? "Remover dos salvos" : "Salvar rota"}
        >
          <Star size={16} className={isSaved ? "fill-primary text-primary" : "text-muted-foreground"} />
        </button>
      </div>
    );
  };

  return (
    <div className="page-container bg-background">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5 capitalize">
            {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" })}
          </p>
          <h1 className="text-2xl font-black text-foreground tracking-tight">Para onde?</h1>
        </div>
        <button
          onClick={() => navigate("/alertas")}
          className="relative w-11 h-11 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
          aria-label="Ver alertas"
        >
          <Bell size={20} className="text-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 alert-badge">{unreadCount}</span>
          )}
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar destino ou linha..."
          className="input-uber pl-11"
        />
      </div>

      {/* Search Results */}
      {search.trim() && (
        <div className="mb-6 animate-fade-in">
          {filteredRoutes.length > 0 ? (
            <div className="bg-card rounded-xl overflow-hidden">
              {filteredRoutes.map((route, i) => <RouteRow key={route.id} route={route} index={i} />)}
            </div>
          ) : (
            <div className="text-center py-10">
              <MapPin size={32} className="mx-auto text-muted-foreground/40 mb-2" />
              <p className="text-muted-foreground text-sm">Nenhuma linha encontrada</p>
            </div>
          )}
        </div>
      )}

      {!search.trim() && (
        <>
          {/* Tipos */}
          <p className="section-title">Tipo de transporte</p>
          <div className="grid grid-cols-3 gap-3 mb-8">
            {(["bus", "van", "boat"] as const).map((type) => {
              const Icon  = typeIcon[type];
              const count = routes.filter((r) => r.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => navigate(`/linhas/${type}`)}
                  className="bg-card rounded-xl flex flex-col items-center gap-2 py-5 active:bg-muted transition-colors border border-border"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${iconBgClass[type]}`}>
                    <Icon size={22} className={iconColorClass[type]} />
                  </div>
                  <span className="text-sm font-bold text-foreground">{typeLabel[type]}</span>
                  <span className="text-[11px] text-muted-foreground">{count} linha{count !== 1 ? "s" : ""}</span>
                </button>
              );
            })}
          </div>

          {/* Banner alertas */}
          {unreadCount > 0 && (
            <button
              onClick={() => navigate("/alertas")}
              className="w-full bg-brand-orange-soft border border-primary/20 rounded-xl p-4 flex items-center gap-3 mb-6 active:opacity-80 transition-opacity"
            >
              <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <Bell size={16} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-bold text-primary">
                  {unreadCount} alerta{unreadCount !== 1 ? "s" : ""} ativo{unreadCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-primary/60">Toque para ver detalhes</p>
              </div>
              <ChevronRight size={16} className="text-primary/40" />
            </button>
          )}

          {/* Rotas salvas */}
          {savedRoutes.length > 0 && (
            <>
              <p className="section-title flex items-center gap-1.5">
                <Star size={11} className="fill-primary text-primary" /> Rotas salvas
              </p>
              <div className="bg-card rounded-xl overflow-hidden border border-border mb-8">
                {savedRoutes.map((route, i) => <RouteRow key={route.id} route={route} index={i} />)}
              </div>
            </>
          )}

          {/* Populares */}
          <p className="section-title">Rotas populares</p>
          <div className="bg-card rounded-xl overflow-hidden border border-border">
            {routes.slice(0, 4).map((route, i) => <RouteRow key={route.id} route={route} index={i} />)}
          </div>
        </>
      )}

      <BottomNav />
    </div>
  );
};

export default HomePage;
