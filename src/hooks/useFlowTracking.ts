import { useAppStore } from "@/store/useAppStore";

/**
 * RNF4.1 — Dados anônimos de fluxo de deslocamento.
 * Registra quais linhas, tipos e destinos são consultados
 * sem nenhum dado pessoal identificável.
 */
export function useFlowTracking() {
  const { recordFlow } = useAppStore();

  const trackRouteView = (routeId: string, type: string, destination: string) => {
    try {
      recordFlow({ routeId, type, destination, at: new Date().toISOString() });
    } catch {
      // Flow analytics must never break route rendering.
    }
  };

  return { trackRouteView };
}
