import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bus, Ship, Truck, ChevronRight } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { routes } from "@/data/mockData";

const typeConfig = {
  bus:  { label: "Ônibus",  Icon: Bus,   colorClass: "transport-icon-bus",  bgClass: "icon-bg-bus"  },
  van:  { label: "Vans",    Icon: Truck, colorClass: "transport-icon-van",  bgClass: "icon-bg-van"  },
  boat: { label: "Barcos",  Icon: Ship,  colorClass: "transport-icon-boat", bgClass: "icon-bg-boat" },
};

const RoutesList = () => {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  const config   = typeConfig[type as keyof typeof typeConfig] || typeConfig.bus;
  const filtered = routes.filter((r) => r.type === type);

  return (
    <div className="page-container bg-background">
      <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform mb-6">
        <ArrowLeft size={20} />
      </button>

      <h1 className="text-3xl font-black text-foreground tracking-tight mb-6">{config.label}</h1>

      <div className="bg-card rounded-xl overflow-hidden border border-border">
        {filtered.map((route, i) => (
          <button
            key={route.id}
            onClick={() => navigate(`/horarios/${route.id}`)}
            className={`w-full flex items-center gap-3 p-4 text-left active:bg-muted transition-colors ${i > 0 ? "border-t border-border" : ""}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${config.bgClass}`}>
              <config.Icon size={18} className={config.colorClass} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{route.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {route.origin} → {route.destination} · {route.duration}
              </p>
              <p className="text-xs font-bold text-foreground mt-0.5">R$ {route.price.toFixed(2)}</p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default RoutesList;
