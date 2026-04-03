'use client'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function ThreeNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!canvasRef.current || window.innerWidth < 768) return

    const canvas = canvasRef.current
    const parent = canvas.parentElement
    if (!parent) return

    const W = parent.offsetWidth * 0.56
    const H = parent.offsetHeight || window.innerHeight

    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(W, H)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
    camera.position.set(0, 0, 7)

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.2))
    const l1 = new THREE.PointLight(0x2563eb, 5, 14)
    l1.position.set(4, 3, 3)
    scene.add(l1)
    
    const l2 = new THREE.PointLight(0x10b981, 3, 10)
    l2.position.set(-4, -2, 2)
    scene.add(l2)
    
    const l3 = new THREE.PointLight(0x93c5fd, 2, 8)
    l3.position.set(0, -4, 2)
    scene.add(l3)

    // Central hub
    const hubGeo = new THREE.IcosahedronGeometry(0.7, 3)
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0x1a3570,
      metalness: 0.95,
      roughness: 0.05,
      emissive: 0x0a1840,
      emissiveIntensity: 0.4,
    })
    const hub = new THREE.Mesh(hubGeo, hubMat)
    scene.add(hub)

    const hubWire = new THREE.Mesh(
      hubGeo,
      new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.15 })
    )
    scene.add(hubWire)

    // Rings
    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.95, 0.02, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.4 })
    )
    ring1.rotation.x = Math.PI / 2.5
    scene.add(ring1)

    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(1.1, 0.015, 8, 80),
      new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.25 })
    )
    ring2.rotation.x = Math.PI / 3
    ring2.rotation.z = Math.PI / 5
    scene.add(ring2)

    // Satellite nodes
    const nodeData = [
      { color: 0x2563eb, emissive: 0x1a3570, size: 0.22, orbit: 2.6, speed: 0.5, tilt: 0.4, offset: 0 },
      { color: 0x10b981, emissive: 0x0a4030, size: 0.20, orbit: 2.2, speed: 0.35, tilt: 1.2, offset: 0.9 },
      { color: 0x3b82f6, emissive: 0x1a2a5a, size: 0.18, orbit: 2.9, speed: 0.62, tilt: -0.8, offset: 1.8 },
      { color: 0x10b981, emissive: 0x0a4030, size: 0.22, orbit: 2.4, speed: 0.28, tilt: 0.6, offset: 2.7 },
      { color: 0x2563eb, emissive: 0x1a3570, size: 0.16, orbit: 3.1, speed: 0.72, tilt: -0.4, offset: 3.6 },
      { color: 0x60a5fa, emissive: 0x1a2a5a, size: 0.20, orbit: 2.0, speed: 0.45, tilt: 1.5, offset: 4.5 },
      { color: 0x10b981, emissive: 0x0a4030, size: 0.18, orbit: 2.7, speed: 0.58, tilt: -1.0, offset: 5.4 },
    ]

    const nodes = nodeData.map((d) => {
      const geo = new THREE.IcosahedronGeometry(d.size, 1)
      const mat = new THREE.MeshStandardMaterial({
        color: d.color,
        metalness: 0.9,
        roughness: 0.1,
        emissive: d.emissive,
        emissiveIntensity: 0.6,
      })
      const mesh = new THREE.Mesh(geo, mat)
      scene.add(mesh)
      return { mesh, ...d, currentPos: new THREE.Vector3() }
    })

    const lineGroup = new THREE.Group()
    scene.add(lineGroup)

    const dotMeshes = nodes.map((n) => {
      const g = new THREE.SphereGeometry(0.04, 8, 8)
      const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.8 }))
      scene.add(m)
      return m
    })

    const dotProgress = nodes.map(() => Math.random())

    // Particles
    const pCount = 280
    const pPos = new Float32Array(pCount * 3)
    for (let i = 0; i < pCount * 3; i++) pPos[i] = (Math.random() - 0.5) * 12
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x2563eb, size: 0.04, transparent: true, opacity: 0.45 })))

    let mx = 0, my = 0
    const onMouseMove = (e: MouseEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2
      my = -(e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('mousemove', onMouseMove)

    let hubRX = 0, hubRY = 0
    let frameId: number

    const animate = (t: number) => {
      frameId = requestAnimationFrame(animate)
      const time = t * 0.001

      hubRX += (my * 0.3 - hubRX) * 0.03
      hubRY += (mx * 0.3 - hubRY) * 0.03
      hub.rotation.x = time * 0.2 + hubRX
      hub.rotation.y = time * 0.3 + hubRY
      hubWire.rotation.copy(hub.rotation)
      ring1.rotation.y = time * 0.4
      ring2.rotation.z = time * -0.3

      // Clear lines and redraw
      while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0])

      nodes.forEach((n, i) => {
        const a = time * n.speed + n.offset
        n.mesh.position.x = Math.cos(a) * n.orbit
        n.mesh.position.y = Math.sin(a * 0.7) * n.orbit * Math.sin(n.tilt)
        n.mesh.position.z = Math.sin(a) * n.orbit * 0.4
        n.mesh.rotation.x = time * 0.8
        n.mesh.rotation.y = time * 1.2
        n.currentPos.copy(n.mesh.position)

        // Line
        const pts = [new THREE.Vector3(0, 0, 0), n.currentPos.clone()]
        const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
        const lineMat = new THREE.LineBasicMaterial({ color: n.color, transparent: true, opacity: 0.15 })
        lineGroup.add(new THREE.Line(lineGeo, lineMat))

        // Dot
        dotProgress[i] = (dotProgress[i] + 0.006) % 1
        dotMeshes[i].position.lerpVectors(new THREE.Vector3(0, 0, 0), n.currentPos, dotProgress[i])
      })

      l1.position.x = Math.sin(time * 0.7) * 5
      l1.position.y = Math.cos(time * 0.5) * 4
      l2.position.x = Math.cos(time * 0.6) * 4
      l2.position.y = Math.sin(time * 0.8) * 3

      renderer.render(scene, camera)
    }

    animate(0)

    const onResize = () => {
      const nw = parent.offsetWidth * 0.56
      const nh = parent.offsetHeight || window.innerHeight
      renderer.setSize(nw, nh)
      camera.aspect = nw / nh
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(frameId)
      renderer.dispose()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 right-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  )
}
