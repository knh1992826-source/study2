// Supabase 연결 확인: node scripts/check-supabase.mjs
// .env 의 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 로 favorites·chats 테이블을 읽고, 임시 행을 넣었다 지운다.
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const env = Object.fromEntries(
  readFileSync('.env', 'utf8').split('\n').filter((l) => l.includes('=') && !l.startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)
const { VITE_SUPABASE_URL: url, VITE_SUPABASE_ANON_KEY: key } = env
if (!url || !key) {
  console.log('❌ .env 에 VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 비어 있습니다.')
  process.exit(1)
}

const db = createClient(url, key)
let ok = true
for (const table of ['favorites', 'chats']) {
  const { error } = await db.from(table).select('id').limit(1)
  console.log(error ? `❌ ${table} 읽기 실패: ${error.message}` : `✅ ${table} 읽기 성공`)
  ok &&= !error
}
if (ok) {
  const ins = await db.from('favorites').insert({ nickname: '__test__', kind: 'tour', title: '연결 테스트' }).select().single()
  console.log(ins.error ? `❌ 쓰기 실패: ${ins.error.message}` : '✅ favorites 쓰기 성공')
  if (!ins.error) {
    const del = await db.from('favorites').delete().eq('id', ins.data.id)
    console.log(del.error ? `⚠ 테스트 행 삭제 실패: ${del.error.message}` : '✅ 테스트 행 삭제 성공')
  }
}
