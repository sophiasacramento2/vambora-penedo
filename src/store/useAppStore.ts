import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authService } from "@/services/authService";
import { favoriteService } from "@/services/favoriteService";
import { reservationService } from "@/services/reservationService";
import { alertService } from "@/services/alertService";
import { flowService } from "@/services/flowService";

export interface Suggestion {
  id: string;
  routeId: string;
  problems: string[];
  details: string;
  createdAt: string;
  read: boolean;
}

interface User {
  id?: string; // UUID do Supabase Auth
  name: string;
  phone: string;
  loggedIn: boolean;
  wallet_balance?: number;
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

export type PaymentStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'recharge' | 'payment' | 'refund';
  status: PaymentStatus;
  createdAt: string;
  asaasPaymentId?: string;
  pixPayload?: string;
  routeName?: string;
  routeType?: "bus" | "van" | "boat";
}

interface AppStore {
  user: User;
  savedRouteIds: string[];
  alertsRead: string[];
  reservations: Reservation[];
  flowEvents: FlowEvent[];
  walletTransactions: WalletTransaction[];
  suggestions: Suggestion[];
  isLoading: boolean;

  setUser: (u: Partial<User>) => void;
  logout: () => void;
  toggleSaveRoute: (id: string) => Promise<void>;
  markAlertRead: (id: string) => Promise<void>;
  markAllAlertsRead: () => Promise<void>;
  addReservation: (r: Reservation, scheduleId?: string) => Promise<void>;
  cancelReservation: (id: string) => Promise<void>;
  recordFlow: (e: FlowEvent) => Promise<void>;
  getFlowSummary: () => Record<string, number>;
  addFunds: (amount: number) => void;
  createPendingRecharge: (amount: number, pixPayload?: string) => string;
  updateTransactionStatus: (id: string, status: PaymentStatus) => void;
  payWithWallet: (amount: number, routeName: string, routeType: "bus" | "van" | "boat") => boolean;
  refundWallet: (amount: number, routeName: string) => void;
  addSuggestion: (s: Omit<Suggestion, "id" | "createdAt" | "read">) => void;
  markSuggestionRead: (id: string) => void;
  
  // Métodos de sincronização com o Supabase
  fetchCloudData: (userId: string) => Promise<void>;
  syncLocalFavoritesToCloud: (userId: string) => Promise<void>;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: { name: "", phone: "", loggedIn: false, wallet_balance: 0 },
      savedRouteIds: [],
      alertsRead: [],
      reservations: [],
      flowEvents: [],
      walletTransactions: [],
      suggestions: [],
      isLoading: false,

      setUser: (u) => {
        set((s) => ({ user: { ...s.user, ...u } }));
        // Se logar e possuir id, inicia sincronização em segundo plano
        const currentUser = get().user;
        if (currentUser.loggedIn && currentUser.id) {
          get().fetchCloudData(currentUser.id);
        }
      },

      logout: () => {
        authService.signOut().catch(() => {});
        set({
          user: { name: "", phone: "", loggedIn: false, wallet_balance: 0 },
          savedRouteIds: [],
          alertsRead: [],
          reservations: [],
          walletTransactions: [],
          suggestions: [],
        });
      },

      toggleSaveRoute: async (id) => {
        const { user, savedRouteIds } = get();
        
        // Atualização Otimista local instantânea (UX rápida sob sol/rua)
        const isSaved = savedRouteIds.includes(id);
        set({
          savedRouteIds: isSaved
            ? savedRouteIds.filter((x) => x !== id)
            : [...savedRouteIds, id],
        });

        // Se autenticado na nuvem, sincroniza com o banco via toggle atômico
        if (user.loggedIn && user.id) {
          try {
            await favoriteService.toggle(user.id, id);
          } catch (err) {
            console.warn('[Zustand] Falha ao sincronizar favorito na nuvem:', err);
          }
        }
      },

      markAlertRead: async (id) => {
        const { user, alertsRead } = get();

        // Salva localmente
        if (!alertsRead.includes(id)) {
          set({ alertsRead: [...alertsRead, id] });
        }

        // Se autenticado, persiste na tabela de junção segura no banco
        if (user.loggedIn && user.id) {
          try {
            await alertService.markAsRead(user.id, id);
          } catch (err) {
            console.warn('[Zustand] Falha ao registrar leitura de alerta na nuvem:', err);
          }
        }
      },

      markAllAlertsRead: async () => {
        const { user } = get();
        const allAlertIds = ["a1", "a2", "a3", "a4"]; // IDs de Fallback do mockData
        
        set({ alertsRead: allAlertIds });

        if (user.loggedIn && user.id) {
          try {
            await alertService.markAllAsRead(user.id, allAlertIds);
          } catch (err) {
            console.warn('[Zustand] Falha ao registrar leituras em lote na nuvem:', err);
          }
        }
      },

      addReservation: async (r, scheduleId) => {
        const { user } = get();

        // Adiciona localmente para feedback visual rápido
        set((s) => ({ reservations: [r, ...s.reservations] }));

        // Se autenticado na nuvem, persiste no banco de dados Supabase
        if (user.loggedIn && user.id) {
          try {
            await reservationService.create({
              user_id: user.id,
              route_id: r.routeId,
              schedule_id: scheduleId || '00000000-0000-0000-0000-000000000000', // GUID dummy fallback se não fornecido
              seats: r.seats,
              total_amount: r.totalPrice,
              payment_method: (r.paymentMethod.toLowerCase() as 'cash' | 'card' | 'pix') || 'cash'
            });
          } catch (err) {
            console.error('[Zustand] Falha ao enviar reserva para o banco:', err);
          }
        }
      },

      cancelReservation: async (id) => {
        const { user, reservations } = get();

        const resToCancel = reservations.find(r => r.id === id);
        
        if (resToCancel && resToCancel.status !== "cancelled") {
          // If paid with wallet, refund the money
          if (resToCancel.paymentMethod === 'wallet' || resToCancel.paymentMethod === 'carteira') {
            get().refundWallet(resToCancel.totalPrice, resToCancel.routeName);
          }
        }

        // Cancela localmente
        set({
          reservations: reservations.map((r) =>
            r.id === id ? { ...r, status: "cancelled" } : r
          ),
        });

        // Se autenticado, cancela na nuvem
        if (user.loggedIn && user.id) {
          try {
            await reservationService.cancel(id);
          } catch (err) {
            console.warn('[Zustand] Falha ao cancelar reserva na nuvem:', err);
          }
        }
      },

      recordFlow: async (e) => {
        const { user, flowEvents } = get();

        // Registra localmente (mantém limite de 500)
        set({
          flowEvents: [e, ...flowEvents].slice(0, 500),
        });

        // Envia de forma assíncrona fire-and-forget para estatísticas seguras no Supabase
        try {
          await flowService.track({
            user_id: user.id || undefined,
            route_id: e.routeId,
            destination: e.destination
          });
        } catch (err) {
          // Falha silenciosa aceitável para analytics secundários
        }
      },

      getFlowSummary: () => {
        const events = get().flowEvents;
        return events.reduce<Record<string, number>>((acc, e) => {
          if (e.destination) {
            acc[e.destination] = (acc[e.destination] || 0) + 1;
          }
          return acc;
        }, {});
      },

      addFunds: (amount) => {
        const { user, walletTransactions } = get();
        const newTransaction: WalletTransaction = {
          id: `tx-${Date.now()}`,
          amount,
          type: 'recharge',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
        };
        set({
          user: { ...user, wallet_balance: (user.wallet_balance || 0) + amount },
          walletTransactions: [newTransaction, ...walletTransactions]
        });
      },

      createPendingRecharge: (amount, pixPayload) => {
        const { walletTransactions } = get();
        const id = `tx-${Date.now()}`;
        const newTransaction: WalletTransaction = {
          id,
          amount,
          type: 'recharge',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          pixPayload
        };
        set({
          walletTransactions: [newTransaction, ...walletTransactions]
        });
        return id;
      },

      updateTransactionStatus: (id, status) => {
        const { walletTransactions, user } = get();
        
        // If we are confirming a pending transaction, we should also add the funds
        const tx = walletTransactions.find(t => t.id === id);
        if (tx && status === 'CONFIRMED' && tx.status !== 'CONFIRMED') {
           set({
             user: { ...user, wallet_balance: (user.wallet_balance || 0) + tx.amount },
             walletTransactions: walletTransactions.map(t => 
               t.id === id ? { ...t, status } : t
             )
           });
        } else {
           set({
             walletTransactions: walletTransactions.map(t => 
               t.id === id ? { ...t, status } : t
             )
           });
        }
      },

      payWithWallet: (amount, routeName, routeType) => {
        const { user, walletTransactions } = get();
        if ((user.wallet_balance || 0) < amount) {
          return false;
        }
        
        const newTransaction: WalletTransaction = {
          id: `tx-${Date.now()}`,
          amount,
          type: 'payment',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          routeName,
          routeType
        };
        
        set({
          user: { ...user, wallet_balance: (user.wallet_balance || 0) - amount },
          walletTransactions: [newTransaction, ...walletTransactions]
        });
        
        return true;
      },

      refundWallet: (amount, routeName) => {
        const { user, walletTransactions } = get();
        
        const newTransaction: WalletTransaction = {
          id: `tx-${Date.now()}`,
          amount,
          type: 'refund',
          status: 'CONFIRMED',
          createdAt: new Date().toISOString(),
          routeName
        };
        
        set({
          user: { ...user, wallet_balance: (user.wallet_balance || 0) + amount },
          walletTransactions: [newTransaction, ...walletTransactions]
        });
      },

      addSuggestion: (s) => {
        const { suggestions } = get();
        const newSuggestion: Suggestion = {
          ...s,
          id: `sug-${Date.now()}`,
          createdAt: new Date().toISOString(),
          read: false,
        };
        set({ suggestions: [newSuggestion, ...suggestions] });
      },

      markSuggestionRead: (id) => {
        const { suggestions } = get();
        set({
          suggestions: suggestions.map((s) =>
            s.id === id ? { ...s, read: true } : s
          ),
        });
      },

      // ─── MÉTODOS DE SINCRONIZAÇÃO COMPLETA SUPABASE ───
      fetchCloudData: async (userId) => {
        set({ isLoading: true });
        try {
          console.log('[Zustand] Carregando dados da nuvem Supabase...');
          
          // 1. Carrega favoritos do banco
          const cloudFavs = await favoriteService.getUserFavorites(userId);
          const savedRouteIds = cloudFavs.map(f => f.route_id);

          // 2. Carrega reservas da nuvem e traduz para a interface do frontend
          const cloudRes = await reservationService.getUserReservations(userId);
          const reservations: Reservation[] = cloudRes.map(r => ({
            id: r.id,
            routeId: r.route_id,
            routeName: (r.routes as { name?: string })?.name || 'Linha Vambora',
            date: new Date(r.reserved_at).toLocaleDateString('pt-BR'),
            time: (r.schedules as { departure_time?: string })?.departure_time || '--:--',
            seats: r.seats,
            totalPrice: Number(r.total_amount),
            paymentMethod: r.payment_method === 'cash' ? 'Dinheiro' : r.payment_method === 'card' ? 'Cartão' : 'Pix',
            passengerName: get().user.name || 'Passageiro',
            status: r.status === 'active' ? 'confirmed' : 'cancelled',
            createdAt: r.reserved_at
          }));

          // 3. Carrega alertas lidos da nuvem
          const alertsRead = await alertService.getReadAlertIds(userId);

          // 4. Carrega saldo da carteira do perfil público
          const { data: profile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', userId)
            .single();

          set({
            savedRouteIds,
            reservations,
            alertsRead,
            user: { ...get().user, wallet_balance: Number(profile?.wallet_balance || 0) }
          });
          console.log('[Zustand] Dados da nuvem carregados com sucesso.');
        } catch (err) {
          console.warn('[Zustand] Falha ao sincronizar dados na nuvem. Mantendo cache local offline:', err);
        } finally {
          set({ isLoading: false });
        }
      },

      syncLocalFavoritesToCloud: async (userId) => {
        await authService.migrateOfflineData(userId);
        await get().fetchCloudData(userId);
      }
    }),
    {
      name: "vambora-store",
      // Apenas persiste dados de fallback. Ao sincronizar, o Zustand atualiza o cache local.
    }
  )
);
