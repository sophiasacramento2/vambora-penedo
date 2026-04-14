import { Home, Map, Wallet, User } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const tabs = [
  { path: "/home",     label: "Início",   icon: Home   },
  { path: "/mapa",     label: "Mapa",     icon: Map    },
  { path: "/carteira", label: "Carteira", icon: Wallet },
  { path: "/perfil",   label: "Perfil",   icon: User   },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav safe-bottom">
      <div className="flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all duration-150"
              aria-label={tab.label}
            >
              <Icon
                size={22}
                strokeWidth={isActive ? 2.5 : 1.8}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
