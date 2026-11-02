// 제주 퀴즈 API → /api/quiz  (키 필요 없음)
//   /api/quiz                 전체 문제
//   /api/quiz?type=dialect    제주어 퀴즈만 (type=trivia 는 제주 상식)
//   /api/quiz?random=1        한 문제만 무작위로
const QUIZ = [
  { type: 'dialect', q: '“삼춘, 어디 감수광?” — 여기서 삼춘은 누구?', a: '동네 어른 누구나' },
  { type: 'dialect', q: '맞장구칠 때 쓰는 “게메마씸”의 뜻은?', a: '그러게요' },
  { type: 'dialect', q: '식당에서 듣는 “하영 먹읍서”의 뜻은?', a: '많이 드세요' },
  { type: 'dialect', q: '따뜻한 온도를 칭찬하는 “맨도롱 또똣”의 뜻은?', a: '알맞게 따뜻하다' },
  { type: 'trivia', q: '도둑·대문·거지가 없다는 제주의 별칭은?', a: '삼무(三無)' },
  { type: 'trivia', q: '대문 대신 나무 3개를 걸쳐 두던 것은?', a: '정낭' },
  { type: 'trivia', q: '곶자왈의 ‘곶’과 ‘자왈’은 무슨 뜻?', a: '곶=숲, 자왈=자갈' },
  { type: 'trivia', q: '제주를 만들었다고 전해지는 거인 여신은?', a: '설문대할망' },
].map((x, i) => ({ id: i + 1, ...x }))

export default function handler(req, res) {
  const { type, random } = req.query || {}
  let list = QUIZ
  if (type) {
    if (type !== 'dialect' && type !== 'trivia') return res.status(400).json({ error: 'type은 dialect 또는 trivia 입니다.' })
    list = QUIZ.filter((x) => x.type === type)
  }
  if (random) list = [list[Math.floor(Math.random() * list.length)]]
  res.status(200).json({ ok: true, count: list.length, items: list })
}
