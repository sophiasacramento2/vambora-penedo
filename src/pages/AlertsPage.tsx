import { useNavigate } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Info, AlertCircle, CheckCheck } from "lucide-react";
import { alerts, routes } from "@/data/mockData";
import { useAppStore } from "@/store/useAppStore";

const iconMap = { warning: AlertTriangle, info: Info, danger: AlertCircle };
const colorMap = {
  danger: "text-red-500 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  warning: "text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
  info: "text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
};

const AlertsPage = () => {
  const navigate = useNavigate();
  const { alertsRead, markAlertRead, markAllAlertsRead } = useAppStore();

  const unreadCount = alerts.filter((a) => !alertsRead.includes(a.id)).length;

  return (
    <div className="min-h-screen bg-background px-4 pt-4 pb-8">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-full bg-muted flex items-center justify-center active:scale-95 transition-transform"
        >
          <ArrowLeft size={20} />
        </button>
        {unreadCount > 0 && (
          <button
            onClick={markAllAlertsRead}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground active:text-foreground transition-colors"
          >
            <CheckCheck size={14} /> Marcar todos como lidos
          </button>
        )}
      </div>

      <h1 className="text-3xl font-black text-foreground tracking-tight mb-6">Alertas</h1>

      {alerts.length === 0 ? (
        <div className="text-center py-16">
          <Info size={32} className="mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground font-medium">Nenhum alerta</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {alerts.map((alert) => {
            const Icon = iconMap[alert.type];
            const isRead = alertsRead.includes(alert.id);
            const linkedRoute = alert.routeId ? routes.find((r) => r.id === alert.routeId) : null;

            return (
              <div
                key={alert.id}
                onClick={() => markAlertRead(alert.id)}
                className={`rounded-xl p-4 border transition-opacity ${colorMap[alert.type]} ${isRead ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <Icon size={20} className="shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-foreground text-sm">{alert.title}</p>
                      {!isRead && (
                        <span className="w-2 h-2 rounded-full bg-current shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-foreground/70 leading-relaxed">{alert.message}</p>
                    <div className="flex items-center justify-between mt-2 flex-wrap gap-2">
                      <p className="text-[11px] text-foreground/50">
                        {new Date(alert.timestamp).toLocaleString("pt-BR", {
                          day: "2-digit", month: "2-digit",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                      {linkedRoute && (
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/horarios/${linkedRoute.id}`); }}
                          className="text-[11px] font-bold underline underline-offset-2 text-foreground/70 active:opacity-50"
                        >
                          Ver linha →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
