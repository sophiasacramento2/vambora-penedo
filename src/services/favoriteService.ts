import { supabase } from '@/lib/supabase'

export const favoriteService = {
  // Buscar todas as rotas favoritadas por um usuário autenticado
  async getUserFavorites(userId: string) {
    const { data, error } = await supabase
      .from('favorites')
      .select('*, routes (*)')
      .eq('user_id', userId)
    if (error) throw error
    return data
  },

  // Toggle atômico e tolerante a concorrência / duplo clique rápido (Race Condition)
  async toggle(userId: string, routeId: string): Promise<boolean> {
    // Primeiro tenta deletar caso já exista
    const { data, error } = await supabase
      .from('favorites')
      .delete()
      .eq('user_id', userId)
      .eq('route_id', routeId)
      .select()

    if (error) throw error

    // Se uma linha foi deletada, significa que o favorito existia e foi removido com sucesso
    if (data && data.length > 0) {
      return false // Removido
    }

    // Caso não tenha sido deletado nada, insere a nova linha atômica de favorito
    const { error: insertError } = await supabase
      .from('favorites')
      .insert({ user_id: userId, route_id: routeId })

    if (insertError) {
      // Código '23505' representa violação de Unique Key no Postgres (ex: clique duplo simultâneo)
      // Se ocorrer devido a race condition, apenas assume que foi adicionado e evita travar a interface
      if (insertError.code === '23505') {
        return true
      }
      throw insertError
    }

    return true // Adicionado
  }
}
