async function call(path, init) {
  const r = await fetch(path, init)
  const j = await r.json()
  if (!r.ok) throw new Error(j.error || r.statusText)
  return j
}

export const ping = () => call('/api/hello')
export const fetchTour = (keyword = '', type = '12') =>
  call(`/api/tour?keyword=${encodeURIComponent(keyword)}&type=${type}`)
export const fetchWeather = (place = '제주시') => call(`/api/weather?place=${encodeURIComponent(place)}`)
export const fetchHeritage = (keyword = '') => call(`/api/heritage?keyword=${encodeURIComponent(keyword)}`)
export const askAgent = (messages) =>
  call('/api/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
  })
