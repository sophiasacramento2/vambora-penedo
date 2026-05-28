import { supabase } from '@/lib/supabase'

export const alertService = {
  // Buscar alertas operacionais ordenados por data
  async getAll() {
    const { data, error } = await supabase
      .from('alerts')
      .select('*, routes (name)')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Obter IDs de alertas lidos pelo usuário logado
  async getReadAlertIds(userId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('user_alerts_read')
      .select('alert_id')
      .eq('user_id', userId)
    if (error) throw error
    return data?.map(r => r.alert_id) || []
  },

  // Marcar um alerta específico como lido por um usuário logado (Tabela de Junção Isolada)
  async markAsRead(userId: string, alertId: string) {
    const { error } = await supabase
      .from('user_alerts_read')
      .insert({ user_id: userId, alert_id: alertId })
      // Se já existir registro, ignora silenciosamente
      .select()
    
    // Tratando duplicidade se houver race condition
    if (error && error.code !== '23505') throw error
  },

  // Marcar múltiplos/todos alertas como lidos de forma atômica
  async markAllAsRead(userId: string, alertIds: string[]) {
    if (alertIds.length === 0) return
    const { error } = await supabase
      .from('user_alerts_read')
      .insert(
        alertIds.map(alertId => ({ user_id: userId, alert_id: alertId }))
      )
    if (error && error.code !== '23505') throw error
  },

  // Subscrição em Tempo Real para novos alertas com severity = danger
  subscribeToNewAlerts(callback: (alert: any) => void) {
    return supabase
      .channel('realtime-danger-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: 'severity=eq.danger'
        },
        (payload) => callback(payload.new)
      )
      .subscribe()
  }
}
