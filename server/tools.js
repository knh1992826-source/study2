// 화면(/api/*)과 에이전트가 함께 쓰는 공공데이터 호출 함수
const KEY = () => process.env.DATA_GO_KR_KEY

const xmlItems = (xml) =>
  [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) =>
    Object.fromEntries(
      [...m[1].matchAll(/<(\w+)>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/\1>/g)].map((t) => [t[1], t[2].trim()]),
    ),
  )

async function readJson(r, name) {
  const text = await r.text()
  try { return JSON.parse(text) }
  catch { throw new Error(`${name} 응답이 JSON이 아님: ${text.slice(0, 120)}`) }
}

// ① 한국관광공사 국문 관광정보 — 제주(areaCode=39) 관광지·여행코스 검색
// contentTypeId: 12 관광지, 14 문화시설, 15 축제·행사, 25 여행코스, 39 음식점
export async function searchTour({ keyword = '', contentTypeId = '12', rows = 10 } = {}) {
  const q = new URLSearchParams({
    serviceKey: KEY(), MobileOS: 'ETC', MobileApp: 'JejuCourse', _type: 'json',
    areaCode: '39', numOfRows: String(rows), pageNo: '1',
  })
  if (contentTypeId) q.set('contentTypeId', contentTypeId)
  if (keyword) q.set('keyword', keyword)
  const op = keyword ? 'searchKeyword2' : 'areaBasedList2'
  const j = await readJson(await fetch(`https://apis.data.go.kr/B551011/KorService2/${op}?${q}`), 'TourAPI')
  const item = j?.response?.body?.items?.item
  const list = !item ? [] : Array.isArray(item) ? item : [item]
  return list.map((i) => ({
    id: i.contentid, title: i.title, addr: i.addr1, image: i.firstimage,
    lng: i.mapx, lat: i.mapy, type: i.contenttypeid,
  }))
}

// ② 기상청 단기예보 — 격자 좌표(제주시 53,38 / 서귀포시 52,33)
const GRID = { 제주시: [53, 38], 서귀포시: [52, 33] }
const SKY = { 1: '맑음', 3: '구름많음', 4: '흐림' }
const PTY = { 0: '없음', 1: '비', 2: '비/눈', 3: '눈', 4: '소나기' }

// 발표시각: 02·05·08·11·14·17·20·23시 (발표 후 약 10분 뒤부터 조회 가능)
function baseDateTime() {
  const kst = new Date(Date.now() + 9 * 3600e3 - 15 * 60e3)
  let h = [23, 20, 17, 14, 11, 8, 5, 2].find((x) => x <= kst.getUTCHours())
  let day = kst
  if (h === undefined) { day = new Date(kst.getTime() - 24 * 3600e3); h = 23 }
  return {
    base_date: day.toISOString().slice(0, 10).replaceAll('-', ''),
    base_time: String(h).padStart(2, '0') + '00',
  }
}

export async function getWeather({ place = '제주시' } = {}) {
  const [nx, ny] = GRID[place] ?? GRID['제주시']
  const q = new URLSearchParams({
    serviceKey: KEY(), dataType: 'JSON', numOfRows: '300', pageNo: '1',
    nx: String(nx), ny: String(ny), ...baseDateTime(),
  })
  const j = await readJson(
    await fetch(`https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst?${q}`), '기상청')
  const items = j?.response?.body?.items?.item ?? []
  const slots = {}
  for (const it of items) (slots[`${it.fcstDate} ${it.fcstTime}`] ??= {})[it.category] = it.fcstValue
  return Object.entries(slots).slice(0, 6).map(([time, v]) => ({
    place, time, temp: Number(v.TMP), sky: SKY[v.SKY] ?? v.SKY,
    rain: PTY[v.PTY] ?? v.PTY, pop: Number(v.POP), wind: Number(v.WSD),
  }))
}

// ③ 국가유산청 국가유산 검색 — 제주(ccbaCtcd=50), 키 불필요
export async function searchHeritage({ keyword = '' } = {}) {
  const q = new URLSearchParams({ ccbaCtcd: '50', pageUnit: '8', pageIndex: '1' })
  if (keyword) q.set('ccbaMnm1', keyword)
  const r = await fetch(`https://www.khs.go.kr/cha/SearchKindOpenapiList.do?${q}`)
  return xmlItems(await r.text()).map((i) => ({
    name: i.ccbaMnm1, kind: i.ccmaName, addr: `${i.ccbaCtcdNm} ${i.ccsiName || ''}`.trim(), id: i.ccbaAsno,
  }))
}

// 에이전트에게 알려 줄 도구 설명 + 실제 함수 연결
export const toolDefs = [
  {
    name: 'search_tour_places',
    description: '한국관광공사 TourAPI로 제주의 관광지·문화시설·축제·여행코스·음식점을 키워드로 검색한다. 여행코스를 짤 때 후보 장소를 찾는 데 쓴다.',
    input_schema: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: '검색어 (예: 성산, 서귀포, 애월, 한라산, 올레)' },
        contentTypeId: { type: 'string', description: '12 관광지, 14 문화시설, 15 축제·행사, 25 여행코스, 39 음식점' },
      },
    },
  },
  {
    name: 'get_weather',
    description: '기상청 단기예보로 제주시/서귀포시의 앞으로 몇 시간 기온·하늘·강수·바람을 조회한다. 코스를 야외/실내 중심으로 고를 때 쓴다.',
    input_schema: {
      type: 'object',
      properties: { place: { type: 'string', enum: ['제주시', '서귀포시'] } },
      required: ['place'],
    },
  },
  {
    name: 'search_heritage',
    description: '국가유산청 API로 제주의 국가유산(문화재)을 이름으로 검색한다. 코스에 역사·문화 정차지를 넣을 때 쓴다.',
    input_schema: { type: 'object', properties: { keyword: { type: 'string' } } },
  },
]
export const toolFns = { search_tour_places: searchTour, get_weather: getWeather, search_heritage: searchHeritage }
