import { useState, useEffect, useRef, useCallback } from "react";
import { Bus, Ship, Truck, Navigation, Layers, X } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { mapRoutes, PENEDO_CENTER, MapRoute } from "@/data/mapRoutes";

const typeIcon  = { bus: Bus,   van: Truck, boat: Ship  };
const typeLabel = { bus: "Ônibus", van: "Vans", boat: "Barcos" };

const typeColor = {
  bus:  { active: "#E8621A", soft: "#fef0e7", border: "#f5c8a0" },
  van:  { active: "#3b7dd8", soft: "#e8f0fb", border: "#a8c4f0" },
  boat: { active: "#1a7a6e", soft: "#e4f4f2", border: "#8dd0c8" },
};

const MapPage = () => {
  const mapRef          = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const layersRef       = useRef<L.LayerGroup>(L.layerGroup());
  const userMarkerRef   = useRef<L.Marker | null>(null);

  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [activeTypes, setActiveTypes]     = useState<Set<string>>(new Set(["bus", "van", "boat"]));
  const [userPos, setUserPos]             = useState<[number, number] | null>(null);

  const route        = mapRoutes.find((r) => r.id === selectedRoute) || null;
  const visibleRoutes = selectedRoute
    ? mapRoutes.filter((r) => r.id === selectedRoute)
    : mapRoutes.filter((r) => activeTypes.has(r.type));

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;
    const map = L.map(mapContainerRef.current, {
      center: PENEDO_CENTER,
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);
    layersRef.current.addTo(map);
    mapRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos([pos.coords.latitude, pos.coords.longitude]),
        () => {},
        { enableHighAccuracy: true }
      );
    }
    return () => { map.remove(); mapRef.current = null; };
  }, []);

  useEffect(() => {
    const layers = layersRef.current;
    layers.clearLayers();
    visibleRoutes.forEach((r) => {
      L.polyline(r.path as L.LatLngExpression[], {
        color: r.color, weight: 4, opacity: 0.85,
      }).addTo(layers);

      r.stops.forEach((stop) => {
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:11px;height:11px;border-radius:50%;background:${r.color};border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.2);"></div>`,
          iconSize: [11, 11],
          iconAnchor: [5, 5],
        });
        L.marker(stop.position as L.LatLngExpression, { icon })
          .bindPopup(`<b style="font-size:13px;font-family:'Plus Jakarta Sans',sans-serif">${stop.name}</b><br/><span style="opacity:0.5;font-size:11px">${r.name}</span>`)
          .addTo(layers);
      });
    });

    if (mapRef.current) {
      if (selectedRoute && route) {
        mapRef.current.fitBounds(
          L.latLngBounds(route.path as L.LatLngExpression[]),
          { padding: [40, 40] }
        );
      } else if (!selectedRoute) {
        mapRef.current.setView(PENEDO_CENTER, 14);
      }
    }
  }, [visibleRoutes, selectedRoute, route]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (userMarkerRef.current) userMarkerRef.current.remove();
    const pos  = userPos || (PENEDO_CENTER as [number, number]);
    const icon = L.divIcon({
      className: "",
      html: `<div style="width:14px;height:14px;border-radius:50%;background:#E8621A;border:3px solid white;box-shadow:0 0 0 2px rgba(232,98,26,0.25);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7],
    });
    userMarkerRef.current = L.marker(pos, { icon })
      .bindPopup(userPos ? "<b>Você está aqui</b>" : "<b>Centro de Penedo</b>")
      .addTo(mapRef.current);
  }, [userPos]);

  const toggleType = (type: string) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
    setSelectedRoute(null);
  };

  const handleLocateMe = useCallback(() => {
    if (userPos && mapRef.current) {
      mapRef.current.flyTo(userPos, 15);
      setSelectedRoute(null);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setUserPos(p);
          mapRef.current?.flyTo(p, 15);
          setSelectedRoute(null);
        },
        () => mapRef.current?.flyTo(PENEDO_CENTER, 14)
      );
    }
  }, [userPos]);

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Mapa */}
      <div className="relative" style={{ height: "55vh", minHeight: 280 }}>
        <div ref={mapContainerRef} className="w-full h-full absolute inset-0 z-0" />

        {/* Filtros por tipo */}
        <div className="absolute top-3 left-3 z-[1000] flex gap-2">
          {(["bus", "van", "boat"] as const).map((type) => {
            const Icon   = typeIcon[type];
            const active = activeTypes.has(type);
            const col    = typeColor[type];
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold transition-all duration-150 shadow-sm"
                style={
                  active
                    ? { background: col.active, color: "#fff", border: `1px solid ${col.active}` }
                    : { background: "#fff", color: "hsl(var(--brand-muted))", border: "1px solid #e2dbd4" }
                }
              >
                <Icon size={13} />
                {typeLabel[type]}
              </button>
            );
          })}
        </div>

        {/* Botão localizar */}
        <button
          className="absolute bottom-4 right-4 z-[1000] w-11 h-11 bg-white rounded-full flex items-center justify-center shadow-md active:scale-95 transition-transform border border-border"
          onClick={handleLocateMe}
        >
          <Navigation size={18} className="text-primary" />
        </button>
      </div>

      {/* Painel inferior */}
      <div className="flex-1 px-4 py-3 bg-background border-t border-border overflow-y-auto">
        <p className="section-title flex items-center gap-1.5">
          <Layers size={11} /> Escolha uma linha
        </p>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {mapRoutes.map((r) => {
            const Icon       = typeIcon[r.type];
            const isSelected = selectedRoute === r.id;
            const col        = typeColor[r.type];
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRoute(isSelected ? null : r.id)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-full shrink-0 transition-all duration-150 text-xs font-bold"
                style={
                  isSelected
                    ? { background: col.active, color: "#fff" }
                    : { background: col.soft, color: col.active, border: `1px solid ${col.border}` }
                }
              >
                <Icon size={13} />
                <span className="whitespace-nowrap">
                  {r.type === "bus"
                    ? r.name.replace("Circular ", "C")
                    : r.name.split(" → ").pop() || r.name.split(" - ").pop()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detalhe da linha selecionada */}
        {route && (
          <div
            className="mt-3 p-4 rounded-xl animate-fade-in"
            style={{ background: typeColor[route.type].soft, border: `1px solid ${typeColor[route.type].border}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-black text-foreground text-sm">{route.name}</p>
              <button
                onClick={() => setSelectedRoute(null)}
                className="w-6 h-6 rounded-full bg-white/60 flex items-center justify-center active:scale-90 transition-transform"
              >
                <X size={12} className="text-foreground" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{route.stops.length} paradas</p>
            <div className="flex flex-wrap gap-1.5">
              {route.stops.map((stop, i) => (
                <span
                  key={i}
                  className="bg-white/70 text-foreground text-[11px] px-2 py-1 rounded-full font-semibold"
                >
                  {stop.name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default MapPage;
