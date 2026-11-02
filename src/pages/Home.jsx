import { Link } from 'react-router-dom'
import { courses } from '../data/courses.js'
import HealthCheck from '../components/HealthCheck.jsx'

export default function Home() {
  return (
    <>
      <section className="hero p-4 p-md-5 mb-4">
        <h1 className="h2">날씨에 맞춰 짜 주는 제주 여행코스</h1>
        <p className="lead mb-3">
          기획 의도: 제주 5개 권역의 여행코스를 오늘의 날씨와 국가유산 정보에 맞춰 골라 주고, 오전·점심·오후·저녁 일정까지 짜 주는 AI 코스 메이커를 만든다.
        </p>
        <Link to="/world" className="btn btn-warning me-2">3D 코스 지도 열기</Link>
        <Link to="/agent" className="btn btn-light me-2">AI에게 코스 짜 달라고 하기</Link>
        <Link to="/explore" className="btn btn-outline-light">직접 탐색하기</Link>
      </section>
      <HealthCheck />
      <div className="row g-3">
        {courses.map((c) => (
          <div className="col-12 col-md-6 col-lg-4" key={c.name}>
            <div className="card h-100">
              <div className="card-body">
                <h5 style={{ color: c.color }}>{c.name}</h5>
                <p className="small text-muted">{c.desc}</p>
                <div className="mb-2">{c.tags.map((t) => <span key={t} className="badge bg-secondary me-1">{t}</span>)}</div>
                <Link to={`/explore?keyword=${encodeURIComponent(c.keyword)}`} className="btn btn-sm btn-primary">코스 보기</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
