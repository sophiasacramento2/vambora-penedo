import { supabase } from '@/lib/supabase'

export const routeService = {
  // Buscar todas as rotas operacionais ativas
  async getAll() {
    const { data, error } = await supabase
      .from('routes')
      .select('*')
      .eq('is_active', true)
      .order('name')
    if (error) throw error
    return data
  },

  // Buscar detalhes de uma rota incluindo pontos de parada e grade de horários
  async getById(id: string) {
    const { data, error } = await supabase
      .from('routes')
      .select(`
        *,
        stops (*),
        schedules (*)
      `)
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },

  // Buscar grade de horários específica filtrada por dia da semana
  async getSchedules(routeId: string, dayType: 'weekday' | 'saturday' | 'sunday_holiday') {
    const { data, error } = await supabase
      .from('schedules')
      .select('departure_time')
      .eq('route_id', routeId)
      .eq('day_type', dayType)
      .order('departure_time')
    if (error) throw error
    return data
  }
}
