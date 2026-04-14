export interface Route {
  id: string;
  name: string;
  type: "bus" | "van" | "boat";
  origin: string;
  destination: string;
  price: number;
  schedules: {
    weekdays: string[];
    saturday: string[];
    sunday: string[];
  };
  duration: string;
  stops?: string[];
  paymentMethods: PaymentMethod[];
  supportsReservation: boolean;
  frequency?: string;
}

export type PaymentMethod = "cash" | "card" | "pix" | "pass";

export const paymentLabels: Record<PaymentMethod, string> = {
  cash: "Dinheiro",
  card: "Cartão",
  pix: "Pix",
  pass: "Cartão de Transporte",
};

export const paymentIcons: Record<PaymentMethod, string> = {
  cash: "💵",
  card: "💳",
  pix: "⚡",
  pass: "🎫",
};

export const routes: Route[] = [
  {
    id: "bus-01",
    name: "Circular 01 - Centro/Rodoviária",
    type: "bus",
    origin: "Terminal Centro",
    destination: "Rodoviária",
    price: 3.50,
    schedules: {
      weekdays: ["05:30","06:00","06:30","07:00","07:30","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","19:30"],
      saturday: ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","14:00","16:00","18:00"],
      sunday: ["07:00","09:00","11:00","14:00","17:00"],
    },
    duration: "25 min",
    frequency: "A cada 30 min",
    stops: ["Terminal Centro","Praça Barão de Penedo","Mercado Municipal","Hospital","Rodoviária"],
    paymentMethods: ["cash","card","pass"],
    supportsReservation: false,
  },
  {
    id: "bus-02",
    name: "Circular 02 - Centro/Bairro Vermelho",
    type: "bus",
    origin: "Terminal Centro",
    destination: "Bairro Vermelho",
    price: 3.50,
    schedules: {
      weekdays: ["05:45","06:15","06:45","07:15","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"],
      saturday: ["06:30","07:30","08:30","10:00","12:00","14:00","16:00","18:00"],
      sunday: ["08:00","10:00","12:00","15:00","17:00"],
    },
    duration: "20 min",
    frequency: "A cada 45 min",
    stops: ["Terminal Centro","Rocheira","Igreja São Gonçalo","Bairro Vermelho"],
    paymentMethods: ["cash","card","pass"],
    supportsReservation: false,
  },
  {
    id: "bus-03",
    name: "Circular 03 - Centro/Santa Luzia",
    type: "bus",
    origin: "Terminal Centro",
    destination: "Santa Luzia",
    price: 3.50,
    schedules: {
      weekdays: ["06:00","06:30","07:00","07:30","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"],
      saturday: ["06:30","08:00","09:30","11:00","13:00","15:00","17:00"],
      sunday: ["07:30","09:30","12:00","15:00","17:30"],
    },
    duration: "22 min",
    frequency: "A cada 60 min",
    stops: ["Terminal Centro","Av. Duque de Caxias","Escola Municipal","Santa Luzia","Conjunto Caixa d'Água"],
    paymentMethods: ["cash","card","pass"],
    supportsReservation: false,
  },
  {
    id: "bus-04",
    name: "Circular 04 - Centro/SESI",
    type: "bus",
    origin: "SESI",
    destination: "SESI (Via Centro)",
    price: 3.50,
    schedules: {
      weekdays: ["05:50","06:20","06:50","07:20","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","17:30","18:00"],
      saturday: ["06:00","07:30","09:00","11:00","13:00","15:00","17:00"],
      sunday: ["08:00","10:00","13:00","16:00"],
    },
    duration: "18 min",
    frequency: "A cada 60 min",
    stops: ["SESI","Terminal Centro","Praça Clementino do Monte","Av. Wanderley","SESI"],
    paymentMethods: ["cash","card","pass"],
    supportsReservation: false,
  },
  {
    id: "van-01",
    name: "Van Penedo → Arapiraca",
    type: "van",
    origin: "Penedo",
    destination: "Arapiraca",
    price: 35.00,
    schedules: {
      weekdays: ["06:00","08:00","10:00","12:00","14:00","16:00","18:00"],
      saturday: ["06:00","08:00","10:00","14:00","17:00"],
      sunday: ["07:00","10:00","15:00"],
    },
    duration: "2h 30min",
    stops: ["Penedo (Rodoviária)","Porto Real do Colégio","São Brás","Arapiraca (Terminal)"],
    paymentMethods: ["cash","pix"],
    supportsReservation: true,
  },
  {
    id: "van-02",
    name: "Van Penedo → Maceió",
    type: "van",
    origin: "Penedo",
    destination: "Maceió",
    price: 45.00,
    schedules: {
      weekdays: ["05:00","06:00","07:00","08:00","10:00","12:00","14:00","16:00","18:00"],
      saturday: ["06:00","08:00","10:00","14:00","17:00"],
      sunday: ["07:00","10:00","16:00"],
    },
    duration: "3h",
    stops: ["Penedo (Rodoviária)","Traipu","Delmiro Gouveia (passagem)","Maceió (Rodoviária)"],
    paymentMethods: ["cash","pix","card"],
    supportsReservation: true,
  },
  {
    id: "boat-01",
    name: "Balsa Penedo → Neópolis",
    type: "boat",
    origin: "Porto de Penedo",
    destination: "Neópolis (SE)",
    price: 5.00,
    schedules: {
      weekdays: ["06:00","07:00","08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"],
      saturday: ["06:00","08:00","10:00","12:00","14:00","16:00","18:00"],
      sunday: ["07:00","09:00","11:00","14:00","16:00"],
    },
    duration: "15 min",
    frequency: "A cada hora",
    stops: ["Porto de Penedo","Terminal Fluvial Neópolis"],
    paymentMethods: ["cash","pix"],
    supportsReservation: false,
  },
  {
    id: "boat-02",
    name: "Barco Turístico - Rio São Francisco",
    type: "boat",
    origin: "Orla de Penedo",
    destination: "Foz do São Francisco",
    price: 80.00,
    schedules: {
      weekdays: ["09:00","14:00"],
      saturday: ["09:00","14:00"],
      sunday: ["09:00"],
    },
    duration: "3h",
    stops: ["Orla de Penedo","Ilha do Ferro","Piaçabuçu","Foz do São Francisco"],
    paymentMethods: ["cash","pix","card"],
    supportsReservation: true,
  },
];

export interface Alert {
  id: string;
  title: string;
  message: string;
  type: "warning" | "info" | "danger";
  routeId?: string;
  timestamp: string;
}

export const alerts: Alert[] = [
  {
    id: "a1",
    title: "Balsa parada por mau tempo",
    message: "A travessia Penedo-Neópolis está suspensa por ventos fortes. Previsão de retorno às 14h.",
    type: "danger",
    routeId: "boat-01",
    timestamp: "2026-04-11T08:30:00",
  },
  {
    id: "a2",
    title: "Van atrasada — bloqueio na BR-101",
    message: "Vans para Maceió saindo com atraso de 40 minutos devido a obra na rodovia.",
    type: "warning",
    routeId: "van-02",
    timestamp: "2026-04-11T07:15:00",
  },
  {
    id: "a3",
    title: "Novo horário da Circular 01",
    message: "A partir de segunda-feira, a Circular 01 terá saída extra às 19:30 nos dias úteis.",
    type: "info",
    routeId: "bus-01",
    timestamp: "2026-04-10T16:00:00",
  },
  {
    id: "a4",
    title: "Circular 03 volta ao normal",
    message: "Após obras na Av. Duque de Caxias, a linha 03 retomou seu trajeto habitual.",
    type: "info",
    routeId: "bus-03",
    timestamp: "2026-04-09T12:00:00",
  },
];

export interface WalletData {
  balance: number;
  cardNumber: string;
  recentTrips: {
    id: string;
    routeName: string;
    date: string;
    amount: number;
    type: "bus" | "van" | "boat";
  }[];
}

export const walletData: WalletData = {
  balance: 42.50,
  cardNumber: "**** **** **** 3847",
  recentTrips: [
    { id: "t1", routeName: "Circular 01", date: "11/04/2026", amount: 3.50, type: "bus" },
    { id: "t2", routeName: "Balsa Penedo-Neópolis", date: "10/04/2026", amount: 5.00, type: "boat" },
    { id: "t3", routeName: "Circular 02", date: "10/04/2026", amount: 3.50, type: "bus" },
    { id: "t4", routeName: "Van Penedo-Maceió", date: "08/04/2026", amount: 45.00, type: "van" },
  ],
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getScheduleForDay(route: Route, date = new Date()): string[] {
  const dow = date.getDay();
  if (dow === 0) return route.schedules.sunday;
  if (dow === 6) return route.schedules.saturday;
  return route.schedules.weekdays;
}

export function getNextDepartures(route: Route, count = 3): string[] {
  const now = new Date();
  const cur = `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
  return getScheduleForDay(route, now).filter((t) => t > cur).slice(0, count);
}

export function minutesUntilNext(route: Route): number | null {
  const nexts = getNextDepartures(route, 1);
  if (!nexts.length) return null;
  const [h, m] = nexts[0].split(":").map(Number);
  const now = new Date();
  return h * 60 + m - (now.getHours() * 60 + now.getMinutes());
}
