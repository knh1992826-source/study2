import { useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { menus } from '../router.jsx'
import { useAppStore } from '../store/useAppStore.js'

export default function RootLayout() {
  const { nickname, setNickname, toast, loadFavorites, loadChat } = useAppStore()

  useEffect(() => {
    loadFavorites()
    loadChat()
  }, [loadFavorites, loadChat])

  return (
    <>
      <nav className="navbar navbar-expand-md myth-nav" data-bs-theme="dark">
        <div className="container">
          <span className="navbar-brand">🧭 제주 코스 메이커</span>
          <ul className="navbar-nav me-auto flex-row flex-wrap gap-3">
            {menus.map((m) => (
              <li key={m.path} className="nav-item">
                <NavLink to={m.path} end className="nav-link">{m.label}</NavLink>
              </li>
            ))}
          </ul>
          <input
            className="form-control form-control-sm w-auto"
            placeholder="닉네임 입력 후 Enter"
            defaultValue={nickname}
            onKeyDown={(e) => e.key === 'Enter' && e.target.value.trim() && setNickname(e.target.value.trim())}
          />
        </div>
      </nav>
      <main className="container py-4">
        <Outlet />
      </main>
      <footer className="container py-4 text-muted small">
        데이터: 한국관광공사 TourAPI · 기상청 단기예보 · 국가유산청 / AI: Claude
      </footer>
      {toast && <div className="toast show position-fixed bottom-0 end-0 m-3"><div className="toast-body">{toast}</div></div>}
    </>
  )
}
