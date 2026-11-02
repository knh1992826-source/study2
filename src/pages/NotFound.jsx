import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1 className="display-4">404</h1>
      <p className="lead">이 주소에는 코스가 없어요. 다른 길로 가 볼까요?</p>
      <Link to="/" className="btn btn-warning">홈으로 돌아가기</Link>
    </div>
  )
}
