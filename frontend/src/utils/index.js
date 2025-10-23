export function createPageUrl(page) {
  const routes = {
    Library: '/library',
    Upload: '/upload',
    Viewer: '/viewer'
  }
  return routes[page] || '/'
}

export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ')
}