import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchTour, fetchWeather, fetchHeritage } from '../api/client.js'
import ItemCard from '../components/ItemCard.jsx'

const TYPES = { 25: '여행코스', 12: '관광지', 14: '문화시설', 15: '축제·행사', 39: '음식점' }

export default function Explore() {
  const [params, setParams] = useSearchParams()
  const keyword = params.get('keyword') || '제주시'
  const type = params.get('type') || '25'
  const [input, setInput] = useState(keyword)
  const [tour, setTour] = useState({ data: [], error: '' })
  const [heritage, setHeritage] = useState({ data: [], error: '' })
  const [weather, setWeather] = useState({ data: [], error: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const ok = (data) => ({ data, error: '' })
    const fail = (e) => ({ data: [], error: e.message })
    Promise.all([
      fetchTour(keyword, type).then(ok, fail).then(setTour),
      fetchHeritage(keyword).then(ok, fail).then(setHeritage),
      fetchWeather('제주시').then(ok, fail).then(setWeather),
    ]).finally(() => setLoading(false))
  }, [keyword, type])

  return (
    <>
      <form className="input-group mb-4" onSubmit={(e) => { e.preventDefault(); setParams({ keyword: input, type }) }}>
        <select className="form-select" style={{ maxWidth: 140 }} value={type} onChange={(e) => setParams({ keyword, type: e.target.value })}>
          {Object.entries(TYPES).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <input className="form-control" value={input} onChange={(e) => setInput(e.target.value)} placeholder="지역·키워드 (예: 성산, 서귀포, 애월, 한라산)" />
        <button className="btn btn-primary">검색</button>
      </form>
      {loading && <div className="spinner-border text-primary mb-3" />}

      <h5>🌤 제주시 날씨 <small className="text-muted">기상청 단기예보</small></h5>
      {weather.error && <div className="alert alert-warning">{weather.error}</div>}
      <div className="d-flex flex-wrap gap-2 mb-2">
        {weather.data.map((w) => (
          <span key={w.time} className="badge bg-secondary fw-normal p-2">
            {w.time.slice(9, 11)}시 {w.temp}℃ {w.sky} · 강수 {w.pop}%
          </span>
        ))}
      </div>

      <h5 className="mt-4">🧭 {TYPES[type]} <small className="text-muted">한국관광공사</small></h5>
      {tour.error && <div className="alert alert-warning">{tour.error}</div>}
      <div className="row g-3">
        {tour.data.map((t) => (
          <div className="col-12 col-md-6 col-lg-3" key={t.id}>
            <ItemCard kind="tour" title={t.title} detail={t.addr} image={t.image} />
          </div>
        ))}
      </div>

      <h5 className="mt-4">🏛 관련 국가유산 <small className="text-muted">국가유산청</small></h5>
      {heritage.error && <div className="alert alert-warning">{heritage.error}</div>}
      <div className="row g-3">
        {heritage.data.map((h) => (
          <div className="col-12 col-md-6 col-lg-3" key={h.id}>
            <ItemCard kind="heritage" title={h.name} detail={`${h.kind} · ${h.addr}`} />
          </div>
        ))}
      </div>
    </>
  )
}
