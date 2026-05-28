import { supabase } from '@/lib/supabase'

export const reservationService = {
  // Buscar o histórico de reservas do usuário logado ordenadas pelas mais recentes
  async getUserReservations(userId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .select('*, routes (name, type, fare), schedules (departure_time)')
      .eq('user_id', userId)
      .order('reserved_at', { ascending: false })
    if (error) throw error
    return data
  },

  // Criar uma nova reserva com integridade
  async create(payload: {
    user_id: string
    route_id: string
    schedule_id: string
    seats: number
    total_amount: number
    payment_method: 'cash' | 'card' | 'pix'
  }) {
    const { data, error } = await supabase
      .from('reservations')
      .insert(payload)
      .select()
      .single()
    if (error) throw error
    return data
  },

  // Cancelar uma reserva atualizando o status e data de cancelamento
  async cancel(reservationId: string) {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('id', reservationId)
      .select()
      .single()
    if (error) throw error
    return data
  }
}
