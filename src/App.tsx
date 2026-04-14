import { BrowserRouter } from "react-router-dom";
import AnimatedRoutes from "@/components/AnimatedRoutes";
import { useNotifications } from "@/hooks/useNotifications";
import { useEffect } from "react";

const theme = localStorage.getItem("theme");
if (theme === "dark") document.documentElement.classList.add("dark");

function AppInner() {
  const { requestPermission } = useNotifications();
  useEffect(() => { requestPermission(); }, []);
  return <AnimatedRoutes />;
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}

export default App;
