import { useEffect, useState } from 'react'
import { ping } from '../api/client.js'
import { supabase } from '../api/supabase.js'

// 홈 화면 "동작 체크": React · 라우터 · Supabase · 서버 함수(/api) · API 키 유무
export default function HealthCheck() {
  const [server, setServer] = useState(null)
  const [db, setDb] = useState(null)

  useEffect(() => {
    ping().then((r) => setServer({ ok: true, ...r }), () => setServer({ ok: false }))
    supabase.from('favorites').select('id').limit(1).then(({ error }) => setDb(!error))
  }, [])

  const mark = (v) => (v === null ? '…' : v ? '✅' : '❌')
  const rows = [
    ['React · 라우터', '✅'],
    ['Supabase 연결', mark(db)],
    ['서버 함수 /api', mark(server && server.ok)],
    ['공공데이터 키', mark(server && server.ok ? server.hasDataKey : server)],
    ['Claude 키', mark(server && server.ok ? server.hasClaudeKey : server)],
  ]
  return (
    <div className="card mb-4">
      <div className="card-body py-2">
        <span className="small text-muted me-3">동작 체크</span>
        {rows.map(([k, v]) => (
          <span key={k} className="me-3 small">{k} {v}</span>
        ))}
      </div>
    </div>
  )
}
