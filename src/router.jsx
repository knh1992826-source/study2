import { createBrowserRouter } from 'react-router-dom'
import RootLayout from './components/RootLayout.jsx'
import Home from './pages/Home.jsx'
import Explore from './pages/Explore.jsx'
import Agent from './pages/Agent.jsx'
import Favorites from './pages/Favorites.jsx'
import World3D from './pages/World3D.jsx'
import NotFound from './pages/NotFound.jsx'

export const menus = [
  { path: '/', label: '홈' },
  { path: '/world', label: '3D 코스 지도' },
  { path: '/explore', label: '코스 탐색' },
  { path: '/agent', label: 'AI 코스 메이커' },
  { path: '/favorites', label: '즐겨찾기' },
]

export default createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Home /> },
      { path: 'world', element: <World3D /> },
      { path: 'explore', element: <Explore /> },
      { path: 'agent', element: <Agent /> },
      { path: 'favorites', element: <Favorites /> },
    ],
  },
])
