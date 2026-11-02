import ItemCard from '../components/ItemCard.jsx'
import { useAppStore } from '../store/useAppStore.js'

export default function Favorites() {
  const { favorites, removeFavorite, nickname } = useAppStore()
  return (
    <>
      <h4>{nickname ? `${nickname}님의 즐겨찾기` : '닉네임을 입력하면 즐겨찾기가 보여요'}</h4>
      <div className="row g-3">
        {favorites.map((f) => (
          <div className="col-12 col-md-6 col-lg-3" key={f.id}>
            <ItemCard kind={f.kind} title={f.title} detail={f.detail} onRemove={() => removeFavorite(f.id)} />
          </div>
        ))}
      </div>
      {nickname && favorites.length === 0 && <p className="text-muted">아직 저장한 장소가 없어요.</p>}
    </>
  )
}
