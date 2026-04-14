import { Bus, Ship, Truck } from "lucide-react";

type TransportType = "bus" | "van" | "boat";

const icons: Record<TransportType, typeof Bus> = {
  bus: Bus,
  van: Truck,
  boat: Ship,
};

const labels: Record<TransportType, string> = {
  bus: "Ônibus",
  van: "Van",
  boat: "Barco/Balsa",
};

const TransportIcon = ({ type, size = 24 }: { type: TransportType; size?: number }) => {
  const Icon = icons[type];
  return (
    <div className="flex items-center gap-2">
      <Icon size={size} />
      <span className="text-sm font-medium">{labels[type]}</span>
    </div>
  );
};

export default TransportIcon;
export type { TransportType };
