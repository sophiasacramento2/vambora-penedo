import { useState, useEffect } from "react";
import { User, Star, MessageSquare, LogOut, ChevronRight, HelpCircle, Moon, Sun, Ticket } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { useAppStore } from "@/store/useAppStore";
import { routes } from "@/data/mockData";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, logout, savedRouteIds, reservations } = useAppStore();
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  const activeReservations = reservations.filter((r) => r.status === "confirmed");
  const savedRoutes = routes.filter((r) => savedRouteIds.includes(r.id));

  const menuItems = [
    {
      icon: Star,
      label: "Rotas salvas",
      badge: savedRoutes.length || undefined,
      action: () => navigate("/home"),
    },
    {
      icon: Ticket,
      label: "Minhas reservas",
      badge: activeReservations.length || undefined,
      action: () => navigate("/reservas"),
    },
    {
      icon: MessageSquare,
      label: "Enviar problema ou sugestão",
      action: () => navigate("/feedback"),
    },
    {
      icon: HelpCircle,
      label: "Ajuda",
      action: () => {},
    },
  ];

  return (
    <div className="page-container bg-background">
      <h1 className="text-2xl font-black text-foreground tracking-tight mb-6">Perfil</h1>

      {/* User Info */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
          <User size={24} className="text-background" />
        </div>
        <div>
          <p className="font-bold text-foreground text-lg">{user.name || "Visitante"}</p>
          <p className="text-sm text-muted-foreground">{user.phone || "Sem conta"}</p>
        </div>
      </div>

      {/* Dark mode */}
      <div className="bg-card rounded-xl overflow-hidden mb-4">
        <button
          onClick={() => setDark(!dark)}
          className="w-full flex items-center gap-3 p-4 text-left active:bg-muted transition-colors"
        >
          {dark ? <Sun size={20} className="text-foreground shrink-0" /> : <Moon size={20} className="text-foreground shrink-0" />}
          <span className="flex-1 font-medium text-sm text-foreground">{dark ? "Modo claro" : "Modo escuro"}</span>
          <div className={`w-10 h-6 rounded-full flex items-center px-0.5 transition-colors ${dark ? "bg-foreground" : "bg-muted"}`}>
            <div className={`w-5 h-5 rounded-full transition-transform duration-200 ${dark ? "translate-x-4 bg-background" : "translate-x-0 bg-muted-foreground"}`} />
          </div>
        </button>
      </div>

      {/* Menu */}
      <div className="bg-card rounded-xl overflow-hidden mb-4">
        {menuItems.map((item, i) => (
          <button
            key={item.label}
            onClick={item.action}
            className={`w-full flex items-center gap-3 p-4 text-left active:bg-muted transition-colors ${i > 0 ? "border-t border-border" : ""}`}
          >
            <item.icon size={20} className="text-foreground shrink-0" />
            <span className="flex-1 font-medium text-sm text-foreground">{item.label}</span>
            {item.badge ? (
              <span className="bg-foreground text-background text-[11px] font-bold px-2 py-0.5 rounded-full">
                {item.badge}
              </span>
            ) : (
              <ChevronRight size={16} className="text-muted-foreground" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={() => { logout(); navigate("/"); }}
        className="w-full flex items-center gap-3 p-4 rounded-xl active:bg-destructive/5 transition-colors"
      >
        <LogOut size={20} className="text-destructive" />
        <span className="font-medium text-sm text-destructive">Sair da conta</span>
      </button>

      <BottomNav />
    </div>
  );
};

export default ProfilePage;
