import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
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
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState<"enter" | "exit">("enter");

  useEffect(() => {
    if (location.pathname !== displayLocation.pathname) {
      setTransitionStage("exit");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "exit") {
      setDisplayLocation(location);
      setTransitionStage("enter");
    }
  };

  return (
    <div
      className={`page-transition ${transitionStage === "enter" ? "page-enter" : "page-exit"}`}
      onAnimationEnd={handleAnimationEnd}
    >
      <Routes location={displayLocation}>
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
