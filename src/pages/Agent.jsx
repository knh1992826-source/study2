import { useState } from 'react'
import { askAgent } from '../api/client.js'
import { useAppStore } from '../store/useAppStore.js'

const examples = ['내일 서귀포 날씨를 보고 1박 2일 코스를 짜줘', '비 오는 날 제주시 실내 위주 하루 코스 추천해줘', '성산 일출 보고 오후엔 국가유산 한 곳 들르는 코스 알려줘']

export default function Agent() {
  const { messages, saveMessage, notify } = useAppStore()
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)

  async function send(q) {
    if (!q.trim() || busy) return
    setText('')
    setBusy(true)
    const history = [...messages, { role: 'user', content: q }]
    await saveMessage({ role: 'user', content: q })
    try {
      const { answer, toolCalls } = await askAgent(history.map(({ role, content }) => ({ role, content })))
      await saveMessage({ role: 'assistant', content: answer, tools: toolCalls.map(({ name, input }) => ({ name, input })) })
    } catch (e) {
      notify('에이전트 오류: ' + e.message)
    }
    setBusy(false)
  }

  return (
    <>
      <h4>AI 코스 메이커</h4>
      <div className="mb-3 d-flex flex-wrap gap-2">
        {examples.map((e) => <button key={e} className="btn btn-sm btn-outline-secondary" onClick={() => send(e)}>{e}</button>)}
      </div>
      <div className="mb-3">
        {messages.map((m, i) => (
          <div key={i} className={`card mb-2 ${m.role === 'user' ? 'border-primary' : ''}`}>
            <div className="card-body">
              <div className="small text-muted mb-1">{m.role === 'user' ? '나' : '안내자'}</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
              {m.tools?.length > 0 && (
                <div className="mt-2">
                  <span className="small text-muted">에이전트가 호출한 도구: </span>
                  {m.tools.map((t, j) => (
                    <span key={j} className="badge bg-info tool-badge me-1">{t.name}({JSON.stringify(t.input)})</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <div className="spinner-border text-primary" />}
      </div>
      <form className="input-group" onSubmit={(e) => { e.preventDefault(); send(text) }}>
        <input className="form-control" value={text} onChange={(e) => setText(e.target.value)} placeholder="날짜·지역·취향을 알려 주세요" />
        <button className="btn btn-primary" disabled={busy}>보내기</button>
      </form>
    </>
  )
}
