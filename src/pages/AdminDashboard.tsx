import React, { useState, useEffect, useRef } from "react";
import {
  ArrowLeft,
  Download,
  FileText,
  MapPinned,
  TriangleAlert,
  Users,
  Bell,
  X,
  MessageSquare
} from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { PENEDO_CENTER } from "@/data/mapRoutes";
import {
  heatPoints,
  delayByLine,
  demandByHour,
  modalDemand,
  chronicDelayTable,
} from "@/data/analyticsData";
import { useAppStore } from "@/store/useAppStore";
import { routes } from "@/data/mockData";

const PIE_COLORS = ["#E8621A", "#3b7dd8", "#1a7a6e"];

const AdminDashboard = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { suggestions, markSuggestionRead } = useAppStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const unreadSuggestions = suggestions.filter((s) => !s.read).length;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: PENEDO_CENTER,
      zoom: 13,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png").addTo(map);

    (L as any)
      .heatLayer(heatPoints, {
        radius: 28,
        blur: 22,
        maxZoom: 17,
        gradient: {
          0.2: "#60a5fa",
          0.4: "#facc15",
          0.7: "#fb923c",
          1.0: "#ef4444",
        },
      })
      .addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  const totalDemand = demandByHour.reduce((acc, item) => acc + item.demanda, 0);
  const averageDelay = Math.round(
    delayByLine.reduce((acc, item) => acc + item.atraso, 0) / delayByLine.length
  );
  const mostCriticalLine = delayByLine.reduce((max, item) =>
    item.atraso > max.atraso ? item : max
  );
  const criticalCases = chronicDelayTable.filter((item) => item.status === "Crítico").length;

  const exportCsvReport = () => {
    const rows = [
      ["Indicador", "Valor"],
      ["Demanda total", String(totalDemand)],
      ["Atraso médio (min)", String(averageDelay)],
      ["Linha mais crítica", mostCriticalLine.linha],
      ["Casos críticos", String(criticalCases)],
      [],
      ["Atrasos por linha"],
      ["Linha", "Atraso médio (min)"],
      ...delayByLine.map((item) => [item.linha, String(item.atraso)]),
      [],
      ["Demanda por horário"],
      ["Hora", "Demanda"],
      ...demandByHour.map((item) => [item.hora, String(item.demanda)]),
      [],
      ["Atrasos crônicos"],
      ["Linha", "Faixa", "Média", "Ocorrências", "Status"],
      ...chronicDelayTable.map((item) => [
        item.linha,
        item.faixa,
        String(item.media),
        String(item.ocorrencias),
        item.status,
      ]),
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "relatorio_gerencial_transporte.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-background px-4 py-5 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <a
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-2"
            >
              <ArrowLeft size={16} />
              Voltar ao mapa
            </a>
            <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center gap-3">
              Dashboard Gerencial de Mobilidade
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitoramento de demanda, atrasos e fluxo para apoio à gestão pública.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setIsNotificationsOpen(true)}
              className="relative p-2 rounded-xl border border-border bg-white text-foreground shadow-sm flex items-center justify-center hover:bg-muted transition-colors"
              title="Notificações e Sugestões"
            >
              <Bell size={20} />
              {unreadSuggestions > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadSuggestions}
                </span>
              )}
            </button>
            <button
              onClick={exportCsvReport}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Download size={16} />
              Exportar CSV
            </button>

            <button
              onClick={printReport}
              className="px-4 py-2 rounded-xl border border-border bg-white text-foreground font-bold text-sm shadow-sm flex items-center gap-2 hover:bg-muted transition-colors"
            >
              <FileText size={16} />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Painel lateral de notificações */}
        {isNotificationsOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm bg-background h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <Bell size={20} />
                  Notificações
                </h2>
                <button
                  onClick={() => setIsNotificationsOpen(false)}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
                {suggestions.length === 0 ? (
                  <div className="text-center text-muted-foreground py-10 flex flex-col items-center gap-2">
                    <MessageSquare size={32} className="opacity-20" />
                    <p>Nenhuma sugestão ou feedback recebido ainda.</p>
                  </div>
                ) : (
                  suggestions.map((sug) => {
                    const routeName = routes.find((r) => r.id === sug.routeId)?.name;
                    return (
                      <div
                        key={sug.id}
                        className={`p-4 rounded-xl border transition-colors cursor-pointer ${
                          sug.read
                            ? "bg-card border-border opacity-70"
                            : "bg-blue-50/50 border-blue-200 shadow-sm"
                        }`}
                        onClick={() => !sug.read && markSuggestionRead(sug.id)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-semibold text-muted-foreground">
                            {new Date(sug.createdAt).toLocaleString("pt-BR")}
                          </span>
                          {!sug.read && (
                            <span className="bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                              NOVO
                            </span>
                          )}
                        </div>
                        {routeName && (
                          <div className="text-xs font-bold text-primary mb-2">
                            Linha: {routeName}
                          </div>
                        )}
                        {sug.problems.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {sug.problems.map((p, i) => (
                              <span key={i} className="text-[10px] bg-muted px-2 py-1 rounded-full font-semibold">
                                {p}
                              </span>
                            ))}
                          </div>
                        )}
                        {sug.details && (
                          <p className="text-sm text-foreground mt-2 break-words">
                            "{sug.details}"
                          </p>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users size={18} className="text-primary" />
              <span className="text-sm font-semibold text-muted-foreground">Demanda total</span>
            </div>
            <p className="text-2xl font-black">{totalDemand}</p>
            <p className="text-xs text-muted-foreground">Passageiros processados no período</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TriangleAlert size={18} className="text-red-500" />
              <span className="text-sm font-semibold text-muted-foreground">Atraso médio</span>
            </div>
            <p className="text-2xl font-black">{averageDelay} min</p>
            <p className="text-xs text-muted-foreground">Média geral entre as linhas monitoradas</p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPinned size={18} className="text-orange-500" />
              <span className="text-sm font-semibold text-muted-foreground">Linha crítica</span>
            </div>
            <p className="text-2xl font-black">{mostCriticalLine.linha}</p>
            <p className="text-xs text-muted-foreground">
              Maior atraso médio: {mostCriticalLine.atraso} min
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <TriangleAlert size={18} className="text-amber-500" />
              <span className="text-sm font-semibold text-muted-foreground">Casos crônicos</span>
            </div>
            <p className="text-2xl font-black">{criticalCases}</p>
            <p className="text-xs text-muted-foreground">Ocorrências classificadas como críticas</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black mb-1">Mapa de calor de demanda</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Visualização espacial das áreas com maior concentração de fluxo.
            </p>
            <div
              ref={mapContainerRef}
              className="w-full h-[380px] rounded-xl overflow-hidden border border-border"
            />
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black mb-1">Atraso médio por linha</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Comparativo das linhas com maior impacto operacional.
              </p>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={delayByLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="linha" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="atraso" fill="#E8621A" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
              <h2 className="text-lg font-black mb-1">Distribuição por modal</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Participação estimada entre ônibus, vans e barcos.
              </p>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={modalDemand}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={78}
                      label
                    >
                      {modalDemand.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black mb-1">Demanda por horário</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Identificação de horários de pico para apoio ao planejamento.
            </p>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={demandByHour}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="demanda"
                    stroke="#3b7dd8"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
            <h2 className="text-lg font-black mb-1">Padrões crônicos de atraso</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Tabela gerencial com faixas de maior reincidência operacional.
            </p>

            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b border-border">
                    <th className="py-2 pr-3">Linha</th>
                    <th className="py-2 pr-3">Faixa</th>
                    <th className="py-2 pr-3">Média</th>
                    <th className="py-2 pr-3">Ocorrências</th>
                    <th className="py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {chronicDelayTable.map((item, index) => (
                    <tr key={index} className="border-b border-border/60">
                      <td className="py-3 pr-3 font-semibold">{item.linha}</td>
                      <td className="py-3 pr-3">{item.faixa}</td>
                      <td className="py-3 pr-3">{item.media} min</td>
                      <td className="py-3 pr-3">{item.ocorrencias}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-bold ${
                            item.status === "Crítico"
                              ? "bg-red-100 text-red-700"
                              : item.status === "Atenção"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-4 shadow-sm">
          <h2 className="text-lg font-black mb-1">Leitura gerencial</h2>
          <p className="text-sm text-muted-foreground leading-6">
            O dashboard permite identificar concentração de demanda, horários de pico,
            linhas com maior atraso médio e recorrência de falhas operacionais. Essas
            informações apoiam decisões de redistribuição de frota, revisão de itinerários,
            reforço em horários críticos e formulação de relatórios para gestão pública.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;