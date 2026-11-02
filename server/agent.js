import Anthropic from '@anthropic-ai/sdk'
import { toolDefs, toolFns } from './tools.js'

const SYSTEM = `너는 '제주 코스 메이커'다. 여행자의 날짜·인원·취향을 듣고 제주 여행코스를 짜 준다.
- 장소·날씨·유산 정보는 추측하지 말고 반드시 도구로 확인한 뒤 답한다.
- 도구 결과에 없는 장소는 지어내지 않고 "결과 없음"이라고 답한다.
- 비가 오거나 강수확률이 높으면 실내 중심 코스를, 맑으면 야외·해안 코스를 제안한다.
- 코스는 "오전 → 점심 → 오후 → 저녁" 순서로 장소 이름과 한 줄 이유를 적는다.
- 한국어로, 5문장 이내로 짧게 답한다.`

// messages: [{role:'user'|'assistant', content:string}]
export async function runAgent(messages) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const convo = messages.slice(-10).map((m) => ({ role: m.role, content: m.content })) // 최근 10개만
  const toolCalls = []
  for (let step = 0; step < 5; step++) {
    const resp = await client.messages.create({
      model: 'claude-sonnet-5-5', max_tokens: 1024, system: SYSTEM, tools: toolDefs, messages: convo,
    })
    if (resp.stop_reason !== 'tool_use') {
      return { answer: resp.content.filter((b) => b.type === 'text').map((b) => b.text).join('\n'), toolCalls }
    }
    convo.push({ role: 'assistant', content: resp.content })
    const results = []
    for (const b of resp.content.filter((b) => b.type === 'tool_use')) {
      let out
      try { out = await toolFns[b.name](b.input ?? {}) } catch (e) { out = { error: String(e.message || e) } }
      toolCalls.push({ name: b.name, input: b.input, result: out })
      results.push({ type: 'tool_result', tool_use_id: b.id, content: JSON.stringify(out).slice(0, 8000) })
    }
    convo.push({ role: 'user', content: results })
  }
  return { answer: '도구 호출이 너무 많아 중단했어요. 질문을 좁혀 주세요.', toolCalls }
}
