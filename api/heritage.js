import { searchHeritage } from '../server/tools.js'

export default async function handler(req, res) {
  try {
    res.status(200).json(await searchHeritage({ keyword: req.query.keyword || '' }))
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) })
  }
}
