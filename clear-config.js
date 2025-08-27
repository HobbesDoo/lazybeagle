// Quick script to clear LazyBeagle configuration from localStorage
// Run this in your browser console if you need to force reload from config.yaml

console.log('🔧 LazyBeagle Config Cleaner')
console.log('Current localStorage config:', localStorage.getItem('lazybeagle-config'))

// Clear the config
localStorage.removeItem('lazybeagle-config')
console.log('✅ Cleared lazybeagle-config from localStorage')

// Reload the page
console.log('🔄 Reloading page to load from config.yaml...')
setTimeout(() => {
  window.location.reload()
}, 1000)
