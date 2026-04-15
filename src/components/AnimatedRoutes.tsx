import { Routes, Route, useLocation } from "react-router-dom";
import Welcome from "@/pages/Welcome";
import HomePage from "@/pages/HomePage";
import CreateAccount from "@/pages/CreateAccount";
import Login from "@/pages/Login";
import RoutesList from "@/pages/RoutesList";
import Schedule from "@/pages/Schedule";
import MapPage from "@/pages/MapPage";
import WalletPage from "@/pages/WalletPage";
import ProfilePage from "@/pages/ProfilePage";
import AlertsPage from "@/pages/AlertsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import ReservationsPage from "@/pages/ReservationsPage";
import NotFound from "@/pages/NotFound";

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <div key={`${location.pathname}-${location.key}`} className="page-transition page-enter">
      <Routes location={location}>
        <Route path="/" element={<Welcome />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/criar-conta" element={<CreateAccount />} />
        <Route path="/entrar" element={<Login />} />
        <Route path="/linhas/:type" element={<RoutesList />} />
        <Route path="/horarios/:routeId" element={<Schedule />} />
        <Route path="/mapa" element={<MapPage />} />
        <Route path="/carteira" element={<WalletPage />} />
        <Route path="/perfil" element={<ProfilePage />} />
        <Route path="/alertas" element={<AlertsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/reservas" element={<ReservationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default AnimatedRoutes;
