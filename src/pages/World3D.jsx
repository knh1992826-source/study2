import { useEffect, useState } from 'react'
import CourseScene from '../components/CourseScene.jsx'
import ItemCard from '../components/ItemCard.jsx'
import { courses } from '../data/courses.js'
import { fetchTour, fetchWeather, fetchHeritage } from '../api/client.js'

export default function World3D() {
  const [name, setName] = useState('')
  const [weather, setWeather] = useState(null)
  const [tour, setTour] = useState([])
  const [heritage, setHeritage] = useState([])
  const [err, setErr] = useState('')
  const course = courses.find((c) => c.name === name)

  // 날씨는 한 번만 받아서 3D 하늘(구름·바람)에 반영
  useEffect(() => {
    fetchWeather('제주시').then(setWeather, (e) => setErr(e.message))
  }, [])

  // 권역 구슬을 클릭하면 그 권역의 여행코스·국가유산을 불러와 패널에 표시
  useEffect(() => {
    if (!course) return
    setErr('')
    fetchTour(course.keyword, '25').then(setTour, (e) => (setTour([]), setErr(e.message)))
    fetchHeritage(course.keyword).then(setHeritage, (e) => (setHeritage([]), setErr(e.message)))
  }, [course])

  const now = weather?.[0]
  const cloudy = now ? now.sky !== '맑음' : false
  const advice = !now ? '' : now.rain !== '없음' || now.pop >= 60 ? '비 예보 → 실내 중심 코스 추천' : '맑은 편 → 야외·해안 코스 추천'

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <div className="scene-wrap">
          <CourseScene selected={name} onSelect={setName} cloudy={cloudy} windSpeed={now?.wind || 0} />
          <div className="scene-hud">
            <div>드래그: 회전 · 휠: 확대 · 빛나는 구슬: 클릭 · 금색 선: 일주 코스</div>
            {now && <div className="mt-1">기상청 → 제주시 {now.temp}℃ {now.sky} · 강수 {now.pop}% · {advice}</div>}
          </div>
        </div>
      </div>
      <div className="col-lg-4">
        {!course && <div className="myth-panel p-3">구슬을 눌러 권역별 여행코스를 확인해 보세요.</div>}
        {course && (
          <div className="myth-panel p-3">
            <h4 style={{ color: course.color }}>{course.name}</h4>
            <p className="small">{course.desc}</p>
            <div className="mb-2">{course.tags.map((t) => <span key={t} className="badge bg-secondary me-1">{t}</span>)}</div>
            {err && <div className="alert alert-warning py-1 small">{err}</div>}
            <h6>🧭 여행코스 (한국관광공사)</h6>
            <div className="row g-2 mb-3">
              {tour.slice(0, 2).map((t) => (
                <div className="col-6" key={t.id}><ItemCard kind="tour" title={t.title} detail={t.addr} image={t.image} /></div>
              ))}
              {tour.length === 0 && <div className="small text-muted">결과 없음</div>}
            </div>
            <h6>🏛 국가유산 (국가유산청)</h6>
            <div className="row g-2">
              {heritage.slice(0, 2).map((h) => (
                <div className="col-6" key={h.id}><ItemCard kind="heritage" title={h.name} detail={h.kind} /></div>
              ))}
              {heritage.length === 0 && <div className="small text-muted">결과 없음</div>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
