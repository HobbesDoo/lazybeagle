// Provider registry for APP panels
// Map provider key -> async component resolver

export const providers = {
  nzbget: () => import('./NzbGetPanel.vue'),
}

export function getProviderComponent(providerKey) {
  const key = String(providerKey || '').toLowerCase()
  const resolver = providers[key]
  return resolver ? resolver : MissingProvider
}

const MissingProvider = {
  name: 'MissingProvider',
  props: { provider: { type: String, default: '' } },
  template:
    '<div style="padding:8px; color:#fff; opacity:0.9">Unknown provider: {{ provider }}</div>',
}
