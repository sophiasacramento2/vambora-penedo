## 🛠️ Tecnologias

```
Frontend        React 18 + TypeScript 5
Build           Vite 5 + SWC
Estilo          Tailwind CSS 3 + shadcn/ui + Radix UI
Mapa            Leaflet 1.9 (tiles CartoCDN)
Estado          Zustand + middleware persist
Formulários     React Hook Form + Zod
Roteamento      React Router v6
PWA             vite-plugin-pwa + Workbox
Notificações    Web Notifications API
Fonte           Plus Jakarta Sans
Ícones          Lucide React
Testes          Vitest + Playwright
```

---

## 🎨 Identidade Visual

A paleta de cores foi pensada para refletir o contexto geográfico e cultural de Penedo:

| Cor | Hex | Uso |
|---|---|---|
| 🟠 Laranja Vambora | `#E8621A` | Cor primária — ações, botões, identidade |
| 🟢 Verde-água São Francisco | `#1a7a6e` | Sucesso, próximas partidas, barcos |
| 🔵 Azul Intermunicipal | `#3b7dd8` | Vans intermunicipais |
| ⚪ Cinza Muted | `#6b6560` | Textos secundários e estado inativo |
| 🟤 Areia Penedo | `#f9f7f4` | Fundo claro |
| ⚫ Noite do Sertão | `#13110e` | Fundo escuro |

---

## 🚀 Como rodar

### Pré-requisitos
- Node.js 18+
- npm ou bun

### Instalação

```bash
# Clone o repositório
git clone https://github.com/sophiasacramento2/vambora-penedo.git
cd vambora-penedo

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse em **http://localhost:5173** (porta padrão do Vite)

### Outros comandos

```bash
npm run build       # Build de produção
npm run preview     # Preview do build
npm run test        # Testes unitários (Vitest)
npm run lint        # Linting (ESLint)
npm run test:e2e    # Testes E2E (Playwright)
```

---

## 📁 Estrutura do projeto

```
src/
├── pages/          # Telas da aplicação
│   ├── HomePage.tsx
│   ├── MapPage.tsx
│   ├── Schedule.tsx
│   ├── AlertsPage.tsx
│   ├── ReservationsPage.tsx
│   ├── WalletPage.tsx
│   ├── ProfilePage.tsx
│   ├── FeedbackPage.tsx
│   ├── Welcome.tsx
│   ├── Login.tsx
│   └── CreateAccount.tsx
├── components/     # Componentes reutilizáveis
│   ├── BottomNav.tsx
│   ├── ReservationModal.tsx
│   ├── LogoIcon.tsx
│   └── AnimatedRoutes.tsx
├── store/          # Estado global (Zustand)
│   └── useAppStore.ts
├── data/           # Dados e helpers
│   ├── mockData.ts
│   └── mapRoutes.ts
├── hooks/          # Hooks customizados
│   ├── useNotifications.ts
│   └── useFlowTracking.ts
└── index.css       # Design system completo
```

---

## 📋 Requisitos atendidos

<details>
<summary><strong>Requisitos Funcionais</strong></summary>

- ✅ RF1.1 — Consultar lista completa de linhas (ônibus, vans, barcos)
- ✅ RF1.2 — Horários por dia útil, sábado e domingo/feriado
- ✅ RF1.3 — Busca por nome, número ou destino
- ✅ RF2.1 — Mapa interativo da área de Penedo
- ✅ RF2.2 — Pontos de parada plotados no mapa
- ✅ RF2.3 — Visualização do trajeto completo de cada linha
- ✅ RF3.1 — Tarifas de cada linha
- ✅ RF3.2 — Formas de pagamento por linha
- ✅ RF3.3 — Reserva de assentos (vans e barcos)
- ✅ RF4.1 — Notificações push sobre atrasos
- ✅ RF4.2 — Alertas sobre mudanças de horários e rotas
- ✅ RF4.3 — Alerta de próxima partida em tempo real
- ✅ RF5.1 — Criação de conta e login com validação
- ✅ RF5.2 — Rotas e paradas salvas como favoritas
- ✅ RF6.1 — Canal de feedback acessível
- ✅ RF6.2 — Relato de problemas operacionais
- ✅ RF6.3 — Envio de sugestões de melhoria

</details>

<details>
<summary><strong>Requisitos Não Funcionais</strong></summary>

- ✅ RNF1.1 — Desempenho: Vite + SWC + cache de tiles do mapa
- ✅ RNF2.1 — Usabilidade: shadcn/ui acessível, ARIA labels, fonte legível
- ✅ RNF3.1 — PWA instalável no celular (vite-plugin-pwa)
- ✅ RNF4.1 — Coleta anônima de dados de fluxo (useFlowTracking)

</details>

---

## 🗺️ Contexto

**Penedo** é um município do estado de Alagoas, localizado às margens do Rio São Francisco, na divisa com Sergipe. A cidade possui transporte público composto por:

- Ônibus circulares urbanos gerenciados pela prefeitura
- Vans intermunicipais para Maceió (capital) e Arapiraca
- Balsa para Neópolis/SE — travessia do Rio São Francisco
- Barcos turísticos para a Foz do São Francisco e Piaçabuçu

O app nasce da necessidade de centralizar e digitalizar essas informações, que hoje são transmitidas apenas por boca a boca ou grupos de WhatsApp.

---

## 🔮 Próximos passos

- [ ] Backend real com Supabase ou API REST
- [ ] GPS em tempo real dos veículos
- [ ] Pagamento integrado via Pix (API Banco Central)
- [ ] Acessibilidade: VoiceOver / TalkBack
- [ ] Dashboard de dados de fluxo para gestores públicos
- [ ] Suporte multilíngue (inglês e espanhol para turistas)
- [ ] Modo offline completo

---

## 📄 Documentação

A documentação técnica completa está disponível em (https://docs.google.com/document/d/1cF4s5yMthEYOWyaBTxayppgbjc7bpPwm/edit?usp=sharing&ouid=117909527538761735989&rtpof=true&sd=true)

---

<div align="center">

Feito com 🧡 em **Penedo, Alagoas — Brasil**

*"Vambora!" — expressão alagoana para "vamos embora"*

</div>
