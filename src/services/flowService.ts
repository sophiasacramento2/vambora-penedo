import { supabase } from '@/lib/supabase'

export const flowService = {
  // Rastreia evento de fluxo de forma segura contra spoofing
  async track(event: { user_id?: string; route_id: string; destination: string }) {
    // Fire-and-forget: Não trava a experiência de navegação do usuário se houver lentidão na rede
    supabase
      .from('flow_events')
      .insert(event)
      .then(({ error }) => {
        if (error) {
          console.warn('[FlowTracking] Falha ao registrar evento de demanda:', error.message)
        }
      })
  },

  // Ranking local e robusto das destinações de maior demanda operacional
  async getTopDestinations(limit = 10) {
    const { data, error } = await supabase
      .from('flow_events')
      .select('destination, route_id')
    if (error) throw error

    const counts: Record<string, number> = {}
    data?.forEach((e) => {
      if (e.destination) {
        counts[e.destination] = (counts[e.destination] || 0) + 1
      }
    })

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([destination, count]) => ({ destination, count }))
  }
}
