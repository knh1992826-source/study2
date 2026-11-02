import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// 로컬 개발용: /api/* 요청을 api/*.js 서버 함수로 연결 (Vercel에서는 자동 처리)
function localApi(env) {
  return {
    name: 'local-api',
    configureServer(server) {
      Object.assign(process.env, env)
      server.middlewares.use(async (req, res, next) => {
        const m = req.url.match(/^\/api\/([\w-]+)(\?.*)?$/)
        if (!m) return next()
        const url = new URL(req.url, 'http://localhost')
        req.query = Object.fromEntries(url.searchParams)
        if (req.method === 'POST') {
          const chunks = []
          for await (const c of req) chunks.push(c)
          req.body = JSON.parse(Buffer.concat(chunks).toString() || '{}')
        }
        res.status = (c) => ((res.statusCode = c), res)
        res.json = (o) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(o))
        }
        try {
          const mod = await server.ssrLoadModule(`/api/${m[1]}.js`)
          await mod.default(req, res)
        } catch (e) {
          res.status(500).json({ error: String(e.message || e) })
        }
      })
    },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), localApi(loadEnv(mode, process.cwd(), ''))],
}))
