import { supabase } from '@/lib/supabase'
import { favoriteService } from './favoriteService'

// Helper para converter celular em e-mail sintético seguro p/ Supabase Auth
function getSyntheticEmail(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '')
  return `${cleanPhone}@vambora.com`
}

export const authService = {
  // Retorna sessão atual de forma síncrona/assíncrona
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  },

  // Cadastro de usuário
  async signUp(phone: string, password: string, fullName: string) {
    const email = getSyntheticEmail(phone)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      phone: phone.replace(/\D/g, ''),
      options: {
        data: {
          full_name: fullName,
        }
      }
    })
    if (error) throw error
    
    // Migrar dados locais do LocalStorage para a nuvem
    if (data.user) {
      await this.migrateOfflineData(data.user.id)
    }

    return data
  },

  // Login de usuário
  async signIn(phone: string, password: string) {
    const email = getSyntheticEmail(phone)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error

    // Migrar dados locais do LocalStorage para a nuvem
    if (data.user) {
      await this.migrateOfflineData(data.user.id)
    }

    return data
  },

  // Logout do Supabase
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  // Migração Offline-to-Cloud (Fidelidade do LocalStorage para o Banco de Dados)
  async migrateOfflineData(userId: string) {
    try {
      const storeStr = localStorage.getItem('vambora-store')
      if (!storeStr) return

      const parsed = JSON.parse(storeStr)
      const savedRouteIds: string[] = parsed?.state?.savedRouteIds || []

      if (savedRouteIds.length === 0) return

      console.log(`[OfflineMigration] Iniciando sincronização de ${savedRouteIds.length} favoritos para o usuário ${userId}...`)

      // Sincroniza todos os favoritos acumulados offline de forma atômica/paralela
      await Promise.all(
        savedRouteIds.map(async (routeId) => {
          try {
            // Tenta inserir na tabela favorites. Como tem unique(user_id, route_id), se já existir o banco ignora/gerencia de forma segura
            await supabase
              .from('favorites')
              .insert({ user_id: userId, route_id: routeId })
          } catch (e) {
            // Ignora duplicados ou erros específicos de rota
          }
        })
      )

      console.log('[OfflineMigration] Favoritos sincronizados com a nuvem com sucesso.')
    } catch (err) {
      console.warn('[OfflineMigration] Falha na migração automática de dados locais:', err)
    }
  }
}
