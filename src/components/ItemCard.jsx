import { useAppStore } from '../store/useAppStore.js'

// 관광지·유산·즐겨찾기 카드를 모두 이 컴포넌트로 표시
export default function ItemCard({ kind, title, detail, image, onRemove }) {
  const addFavorite = useAppStore((s) => s.addFavorite)
  return (
    <div className="card h-100">
      {image && <img src={image} className="card-img-top" alt={title} style={{ height: 160, objectFit: 'cover' }} />}
      <div className="card-body">
        <span className="badge bg-secondary mb-2">{kind === 'tour' ? '관광지' : '국가유산'}</span>
        <h6 className="card-title">{title}</h6>
        <p className="card-text small text-muted">{detail}</p>
      </div>
      <div className="card-footer bg-transparent border-0">
        {onRemove ? (
          <button className="btn btn-sm btn-outline-danger" onClick={onRemove}>삭제</button>
        ) : (
          <button className="btn btn-sm btn-outline-primary" onClick={() => addFavorite({ kind, title, detail })}>♡ 즐겨찾기</button>
        )}
      </div>
    </div>
  )
}
