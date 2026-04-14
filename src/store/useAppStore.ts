import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  name: string;
  phone: string;
  loggedIn: boolean;
}

export interface Reservation {
  id: string;
  routeId: string;
  routeName: string;
  date: string;
  time: string;
  seats: number;
  totalPrice: number;
  paymentMethod: string;
  passengerName: string;
  status: "confirmed" | "cancelled";
  createdAt: string;
}

export interface FlowEvent {
  routeId: string;
  type: string;
  destination: string;
  at: string;
}

interface AppStore {
  user: User;
  savedRouteIds: string[];
  alertsRead: string[];
  reservations: Reservation[];
  flowEvents: FlowEvent[];

  setUser: (u: Partial<User>) => void;
  logout: () => void;
  toggleSaveRoute: (id: string) => void;
  markAlertRead: (id: string) => void;
  markAllAlertsRead: () => void;
  addReservation: (r: Reservation) => void;
  cancelReservation: (id: string) => void;
  recordFlow: (e: FlowEvent) => void;
  getFlowSummary: () => Record<string, number>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: { name: "", phone: "", loggedIn: false },
      savedRouteIds: [],
      alertsRead: [],
      reservations: [],
      flowEvents: [],

      setUser: (u) => set((s) => ({ user: { ...s.user, ...u } })),
      logout: () => set({ user: { name: "", phone: "", loggedIn: false } }),

      toggleSaveRoute: (id) =>
        set((s) => ({
          savedRouteIds: s.savedRouteIds.includes(id)
            ? s.savedRouteIds.filter((x) => x !== id)
            : [...s.savedRouteIds, id],
        })),

      markAlertRead: (id) =>
        set((s) => ({
          alertsRead: s.alertsRead.includes(id)
            ? s.alertsRead
            : [...s.alertsRead, id],
        })),

      markAllAlertsRead: () =>
        set({ alertsRead: ["a1", "a2", "a3", "a4"] }),

      addReservation: (r) =>
        set((s) => ({ reservations: [r, ...s.reservations] })),

      cancelReservation: (id) =>
        set((s) => ({
          reservations: s.reservations.map((r) =>
            r.id === id ? { ...r, status: "cancelled" } : r
          ),
        })),

      // RNF4.1 — registra evento anônimo de fluxo
      recordFlow: (e) =>
        set((s) => ({
          // mantém só os últimos 500 eventos pra não estourar o localStorage
          flowEvents: [e, ...s.flowEvents].slice(0, 500),
        })),

      // Retorna ranking de destinos mais consultados
      getFlowSummary: () => {
        const events = get().flowEvents;
        return events.reduce<Record<string, number>>((acc, e) => {
          acc[e.destination] = (acc[e.destination] || 0) + 1;
          return acc;
        }, {});
      },
    }),
    { name: "vambora-store" }
  )
);
