import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { courses, route } from '../data/courses.js'

// 3D 제주 코스 지도: 한라산·오름·바다 위에 5개 권역이 빛나는 구슬로 떠 있고, 일주 코스가 선으로 이어진다.
// cloudy=true(기상청 하늘상태가 흐림)이면 구름이 끼고 / windy이면 바람 입자가 빨라진다.
export default function CourseScene({ selected, onSelect, cloudy, windSpeed }) {
  const mount = useRef(null)
  const api = useRef({})

  useEffect(() => {
    const el = mount.current
    const scene = new THREE.Scene()
    scene.background = new THREE.Color('#0b1020')
    scene.fog = new THREE.Fog('#0b1020', 14, 34)
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 8, 13)
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setSize(el.clientWidth, el.clientHeight)
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
    el.appendChild(renderer.domElement)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.maxPolarAngle = Math.PI / 2.05
    controls.minDistance = 5
    controls.maxDistance = 22

    scene.add(new THREE.AmbientLight('#8899cc', 0.7))
    const moon = new THREE.DirectionalLight('#fff3d6', 1.4)
    moon.position.set(6, 10, 4)
    scene.add(moon)

    // 바다
    const sea = new THREE.Mesh(
      new THREE.CircleGeometry(30, 64),
      new THREE.MeshStandardMaterial({ color: '#10335c', roughness: 0.35, metalness: 0.3 }),
    )
    sea.rotation.x = -Math.PI / 2
    scene.add(sea)

    // 섬 본체(타원형 받침) + 한라산 + 오름들
    const stone = new THREE.MeshStandardMaterial({ color: '#4d6b52', roughness: 0.9, flatShading: true })
    const island = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.1, 0.5, 40), stone)
    island.scale.set(7.2, 1, 4.2)
    island.position.y = 0.2
    scene.add(island)
    const hallasan = new THREE.Mesh(new THREE.ConeGeometry(2.6, 3.4, 28), new THREE.MeshStandardMaterial({ color: '#5f7f63', roughness: 0.9, flatShading: true }))
    hallasan.position.y = 1.9
    scene.add(hallasan)
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.55, 0.5, 20), new THREE.MeshStandardMaterial({ color: '#e8f0ff', flatShading: true }))
    cap.position.y = 3.45
    scene.add(cap)
    let seed = 7
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 38; i++) {
      const a = rnd() * Math.PI * 2
      const r = 1.9 + rnd() * 3.6
      const h = 0.3 + rnd() * 0.45
      const oreum = new THREE.Mesh(new THREE.ConeGeometry(0.28 + rnd() * 0.22, h, 10), stone)
      oreum.position.set(Math.cos(a) * r * 1.35, 0.45 + h / 2, Math.sin(a) * r * 0.78)
      scene.add(oreum)
    }

    // 권역 구슬 + 기둥
    const orbs = courses.map((m) => {
      const g = new THREE.Group()
      g.position.set(...m.pos)
      const orb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 24), new THREE.MeshStandardMaterial({ color: m.color, emissive: m.color, emissiveIntensity: 1.2 }))
      orb.userData.name = m.name
      const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 4, 8), new THREE.MeshBasicMaterial({ color: m.color, transparent: true, opacity: 0.35 }))
      beam.position.y = 2
      g.add(orb, beam)
      g.add(new THREE.PointLight(m.color, 6, 5))
      scene.add(g)
      return { g, orb, m }
    })

    // 일주 코스 경로선 (제주시 → 성산 → 서귀포 → 서부)
    const pts = route.map((n) => courses.find((c) => c.name === n).pos).map(([x, , z]) => new THREE.Vector3(x, 0.9, z))
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.4)
    scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.04, 8, true), new THREE.MeshBasicMaterial({ color: '#f3c677' })))
    const runner = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color: '#ffffff' }))
    scene.add(runner)

    // 구름
    const clouds = new THREE.Group()
    const cloudMat = new THREE.MeshStandardMaterial({ color: '#cfd8ea', transparent: true, opacity: 0.8 })
    for (let i = 0; i < 9; i++) {
      const c = new THREE.Mesh(new THREE.SphereGeometry(0.8 + rnd() * 0.6, 12, 12), cloudMat)
      c.scale.y = 0.45
      c.position.set((rnd() - 0.5) * 12, 4.6 + rnd(), (rnd() - 0.5) * 7)
      clouds.add(c)
    }
    scene.add(clouds)

    // 별 + 바람 입자
    const makePoints = (n, spread, size, color) => {
      const pos = new Float32Array(n * 3)
      for (let i = 0; i < n * 3; i++) pos[i] = (rnd() - 0.5) * spread
      const geo = new THREE.BufferGeometry()
      geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
      return new THREE.Points(geo, new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.8 }))
    }
    const stars = makePoints(500, 60, 0.08, '#ffffff')
    stars.position.y = 20
    scene.add(stars)
    const wind = makePoints(220, 24, 0.07, '#a9d6ff')
    wind.position.y = 3
    scene.add(wind)

    // 클릭 선택
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    let moved = false
    const onDown = () => (moved = false)
    const onMoveMouse = () => (moved = true)
    const onClick = (e) => {
      if (moved) return
      const r = renderer.domElement.getBoundingClientRect()
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(orbs.map((o) => o.orb))[0]
      if (hit) onSelectRef.current(hit.object.userData.name)
    }
    const dom = renderer.domElement
    dom.addEventListener('pointerdown', onDown)
    dom.addEventListener('pointermove', onMoveMouse)
    dom.addEventListener('click', onClick)

    const onSelectRef = { current: onSelect }
    api.current = { orbs, clouds, wind, onSelectRef, cloudy: false, windSpeed: 1, selected: '' }

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    addEventListener('resize', onResize)

    const clock = new THREE.Clock()
    let raf
    const tick = () => {
      const t = clock.getElapsedTime()
      const a = api.current
      runner.position.copy(curve.getPointAt((t * 0.05) % 1))
      orbs.forEach(({ g, orb, m }, i) => {
        g.position.y = m.pos[1] + 0.08 * Math.sin(t * 1.6 + i)
        const on = a.selected === m.name
        orb.scale.setScalar(on ? 1.5 + 0.15 * Math.sin(t * 5) : 1)
      })
      clouds.visible = a.cloudy
      clouds.rotation.y = t * 0.03
      const pos = wind.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        pos.setX(i, pos.getX(i) + 0.01 * a.windSpeed)
        if (pos.getX(i) > 12) pos.setX(i, -12)
      }
      pos.needsUpdate = true
      stars.rotation.y = t * 0.01
      controls.update()
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    return () => {
      cancelAnimationFrame(raf)
      removeEventListener('resize', onResize)
      dom.removeEventListener('pointerdown', onDown)
      dom.removeEventListener('pointermove', onMoveMouse)
      dom.removeEventListener('click', onClick)
      controls.dispose()
      renderer.dispose()
      el.removeChild(dom)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    Object.assign(api.current, { selected, cloudy, windSpeed: 1 + (windSpeed || 0) * 0.8 })
    if (api.current.onSelectRef) api.current.onSelectRef.current = onSelect
  })

  return <div ref={mount} style={{ width: '100%', height: '100%', minHeight: 420 }} />
}
