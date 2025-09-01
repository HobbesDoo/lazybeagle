// Provider registry for APP panels
// Map provider key -> async component using defineAsyncComponent
import { defineAsyncComponent } from 'vue'

export const providers = {
  nzbget: defineAsyncComponent(() => import('./NzbGetPanel.vue')),
}

export function getProviderComponent(providerKey) {
  const key = String(providerKey || '').toLowerCase()
  const comp = providers[key]
  return comp || MissingProvider
}

const MissingProvider = {
  name: 'MissingProvider',
  props: { provider: { type: String, default: '' } },
  template:
    '<div style="padding:8px; color:#fff; opacity:0.9">Unknown provider: {{ provider }}</div>',
}
