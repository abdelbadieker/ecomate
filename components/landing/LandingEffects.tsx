'use client'
import { useEffect, useState } from 'react'

export default function LandingEffects() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted) return
    // ── CURSOR ──
    const cur = document.getElementById('em-cursor')
    const ring = document.getElementById('em-cursor-ring')
    if (cur && ring) {
      // Start at center to avoid corner stuck
      let cx = window.innerWidth / 2, cy = window.innerHeight / 2
      let rx = cx, ry = cy
      
      const onMove = (e: MouseEvent) => {
        cx = e.clientX; cy = e.clientY
        cur.style.transform = `translate3d(${cx}px, ${cy}px, 0) translate(-50%, -50%)`
      }
      
      window.addEventListener('mousemove', onMove, { passive: true })
      
      let rafId: number
      const loop = () => {
        rx += (cx - rx) * 0.15
        ry += (cy - ry) * 0.15
        ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`
        rafId = requestAnimationFrame(loop)
      }
      loop()
      
      return () => {
        window.removeEventListener('mousemove', onMove)
        cancelAnimationFrame(rafId)
      }
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    // ── SCROLL REVEAL ──
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('sr-vis')
          obs.unobserve(e.target)
        }
      })
    }, { threshold: .08, rootMargin: '0px 0px -40px 0px' })
    document.querySelectorAll('.sr-el').forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    // ── BENTO GLOW ON HOVER ──
    const cards = document.querySelectorAll<HTMLElement>('.bc-glow')
    const cleanups: (() => void)[] = []
    
    cards.forEach(c => {
      const onMove = (e: MouseEvent) => {
        const r = c.getBoundingClientRect()
        const x = ((e.clientX - r.left) / r.width * 100).toFixed(1)
        const y = ((e.clientY - r.top) / r.height * 100).toFixed(1)
        c.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(37,99,235,.09), rgba(255,255,255,.028) 55%)`
      }
      const onLeave = () => { c.style.background = '' }
      c.addEventListener('mousemove', onMove as EventListener)
      c.addEventListener('mouseleave', onLeave)
      cleanups.push(() => {
        c.removeEventListener('mousemove', onMove as EventListener)
        c.removeEventListener('mouseleave', onLeave)
      })
    })
    return () => cleanups.forEach(fn => fn())
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    // ── COUNTER ANIMATION ──
    const cobs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return
        e.target.querySelectorAll<HTMLElement>('[data-count]').forEach(el => {
          const end = +el.dataset.count!, suf = el.dataset.suf || ''
          let n = 0
          const dur = 1600, steps = 60, inc = end / steps
          const id = setInterval(() => {
            n = Math.min(n + inc, end)
            el.textContent = Math.round(n).toLocaleString() + suf
            if (n >= end) clearInterval(id)
          }, dur / steps)
        })
        cobs.unobserve(e.target)
      })
    }, { threshold: .3 })
    document.querySelectorAll('.counter-group').forEach(el => cobs.observe(el))
    return () => cobs.disconnect()
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    // ── NAVBAR SCROLL ──
    const nav = document.getElementById('em-nav')
    if (!nav) return
    const onScroll = () => {
      if (window.scrollY > 30) {
        nav.style.background = 'rgba(7,16,31,.96)'
        nav.style.boxShadow = '0 4px 40px rgba(0,0,0,.12)'
      } else {
        nav.style.background = 'var(--nav-bg)'
        nav.style.boxShadow = 'none'
      }
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [mounted])

  useEffect(() => {
    if (!mounted) return
    // ── THREE.JS CANVAS ──
    const canvas = document.getElementById('hcanvas') as HTMLCanvasElement | null
    if (!canvas || window.innerWidth < 768) return

    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js'
    script.onload = () => {
      const THREE = (window as any).THREE
      const W = canvas.parentElement!.offsetWidth * 0.56
      const H = canvas.parentElement!.offsetHeight || window.innerHeight

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
      renderer.setPixelRatio(Math.min(devicePixelRatio, 2))
      renderer.setSize(W, H)

      const scene = new THREE.Scene()
      const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100)
      camera.position.set(0, 0, 7)

      scene.add(new THREE.AmbientLight(0xffffff, 0.2))
      const l1 = new THREE.PointLight(0x2563eb, 5, 14); l1.position.set(4, 3, 3); scene.add(l1)
      const l2 = new THREE.PointLight(0x10b981, 3, 10); l2.position.set(-4, -2, 2); scene.add(l2)
      const l3 = new THREE.PointLight(0x93c5fd, 2, 8); l3.position.set(0, -4, 2); scene.add(l3)

      const hubGeo = new THREE.IcosahedronGeometry(0.7, 3)
      const hub = new THREE.Mesh(hubGeo, new THREE.MeshStandardMaterial({
        color: 0x1a3570, metalness: 0.95, roughness: 0.05, emissive: 0x0a1840, emissiveIntensity: 0.4
      }))
      scene.add(hub)
      const hubWire = new THREE.Mesh(hubGeo,
        new THREE.MeshBasicMaterial({ color: 0x2563eb, wireframe: true, transparent: true, opacity: 0.15 }))
      scene.add(hubWire)

      const ring1 = new THREE.Mesh(
        new THREE.TorusGeometry(0.95, 0.02, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.4 }))
      ring1.rotation.x = Math.PI / 2.5; scene.add(ring1)

      const ring2 = new THREE.Mesh(
        new THREE.TorusGeometry(1.1, 0.015, 8, 80),
        new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.25 }))
      ring2.rotation.x = Math.PI / 3; ring2.rotation.z = Math.PI / 5; scene.add(ring2)

      const nodeData = [
        { color: 0x2563eb, emissive: 0x1a3570, size: 0.22, orbit: 2.6, speed: 0.5, tilt: 0.4, offset: 0 },
        { color: 0x10b981, emissive: 0x0a4030, size: 0.20, orbit: 2.2, speed: 0.35, tilt: 1.2, offset: 0.9 },
        { color: 0x3b82f6, emissive: 0x1a2a5a, size: 0.18, orbit: 2.9, speed: 0.62, tilt: -0.8, offset: 1.8 },
        { color: 0x10b981, emissive: 0x0a4030, size: 0.22, orbit: 2.4, speed: 0.28, tilt: 0.6, offset: 2.7 },
        { color: 0x2563eb, emissive: 0x1a3570, size: 0.16, orbit: 3.1, speed: 0.72, tilt: -0.4, offset: 3.6 },
        { color: 0x60a5fa, emissive: 0x1a2a5a, size: 0.20, orbit: 2.0, speed: 0.45, tilt: 1.5, offset: 4.5 },
        { color: 0x10b981, emissive: 0x0a4030, size: 0.18, orbit: 2.7, speed: 0.58, tilt: -1.0, offset: 5.4 },
      ]
      const nodes = nodeData.map(d => {
        const mesh = new THREE.Mesh(
          new THREE.IcosahedronGeometry(d.size, 1),
          new THREE.MeshStandardMaterial({ color: d.color, metalness: 0.9, roughness: 0.1, emissive: d.emissive, emissiveIntensity: 0.6 })
        )
        scene.add(mesh)
        return { mesh, ...d, currentPos: new THREE.Vector3() }
      })

      const lineGroup = new THREE.Group(); scene.add(lineGroup)
      const updateLines = () => {
        while (lineGroup.children.length) lineGroup.remove(lineGroup.children[0])
        nodes.forEach(n => {
          const geo = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), n.currentPos.clone()])
          lineGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: n.color, transparent: true, opacity: 0.2 })))
        })
      }

      const pGeo = new THREE.BufferGeometry()
      const pPos = new Float32Array(280 * 3)
      for (let i = 0; i < 280 * 3; i++) pPos[i] = (Math.random() - 0.5) * 12
      pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3))
      scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0x2563eb, size: 0.04, transparent: true, opacity: 0.45 })))

      const dotMeshes = nodes.map((n) => {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), new THREE.MeshBasicMaterial({ color: n.color, transparent: true, opacity: 0.8 }))
        scene.add(m); return m
      })

      let mx = 0, my = 0
      const onMouseMove = (e: MouseEvent) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = -(e.clientY / innerHeight - 0.5) * 2 }
      document.addEventListener('mousemove', onMouseMove)

      let hubRX = 0, hubRY = 0
      const dotProgress = nodes.map(() => Math.random())
      let rafId: number
      let isVisible = true

      const animate = (t: number) => {
        if (!isVisible) return
        rafId = requestAnimationFrame(animate)
        const time = t * 0.001
        hubRX += (my * 0.3 - hubRX) * 0.03
        hubRY += (mx * 0.3 - hubRY) * 0.03
        hub.rotation.x = time * 0.2 + hubRX; hub.rotation.y = time * 0.3 + hubRY
        hubWire.rotation.copy(hub.rotation)
        ring1.rotation.y = time * 0.4; ring2.rotation.z = time * -0.3
        nodes.forEach((n, i) => {
          const a = time * n.speed + n.offset
          n.mesh.position.x = Math.cos(a) * n.orbit
          n.mesh.position.y = Math.sin(a * 0.7) * n.orbit * Math.sin(n.tilt)
          n.mesh.position.z = Math.sin(a) * n.orbit * 0.4
          n.mesh.rotation.x = time * 0.8; n.mesh.rotation.y = time * 1.2
          n.currentPos.copy(n.mesh.position)
          dotProgress[i] = (dotProgress[i] + 0.006) % 1
          dotMeshes[i].position.lerpVectors(new THREE.Vector3(0, 0, 0), n.currentPos, dotProgress[i])
        })
        updateLines()
        l1.position.x = Math.sin(time * 0.7) * 5; l1.position.y = Math.cos(time * 0.5) * 4
        l2.position.x = Math.cos(time * 0.6) * 4; l2.position.y = Math.sin(time * 0.8) * 3
        renderer.render(scene, camera)
      }

      const observer = new IntersectionObserver((entries) => {
        isVisible = entries[0].isIntersecting
        if (isVisible) {
          rafId = requestAnimationFrame(animate)
        } else {
          cancelAnimationFrame(rafId)
        }
      }, { threshold: 0 })
      
      if (canvas.parentElement) observer.observe(canvas.parentElement)

      const onResize = () => {
        const nw = canvas.parentElement!.offsetWidth * 0.56
        renderer.setSize(nw, H); camera.aspect = nw / H; camera.updateProjectionMatrix()
      }
      window.addEventListener('resize', onResize)

      // Cleanup stored on canvas element for removal
      ;(canvas as any)._cleanup = () => {
        cancelAnimationFrame(rafId)
        observer.disconnect()
        document.removeEventListener('mousemove', onMouseMove)
        window.removeEventListener('resize', onResize)
      }
    }
    document.head.appendChild(script)

    return () => {
      ;(canvas as any)._cleanup?.()
    }
  }, [mounted])

  if (!mounted) return null

  return (
    <>
      {/* Custom cursor */}
      <div id="em-cursor" style={{
        position: 'fixed', width: 10, height: 10, borderRadius: '50%',
        background: '#2563eb', pointerEvents: 'none', zIndex: 9999,
        transform: 'translate(-50%,-50%)', mixBlendMode: 'screen',
        transition: 'width .2s, height .2s, background .2s',
        willChange: 'transform',
      }} />
      <div id="em-cursor-ring" style={{
        position: 'fixed', width: 32, height: 32, borderRadius: '50%',
        border: '1px solid rgba(37,99,235,.4)', pointerEvents: 'none',
        zIndex: 9998, transform: 'translate(-50%,-50%)',
        willChange: 'transform',
      }} />
      {/* Film grain noise overlay */}
      <div style={{
        position: 'fixed', inset: 0, opacity: .025, pointerEvents: 'none', zIndex: 1000,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: '200px 200px',
      }} />
      <style>{`
        @keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
        @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(12px)}}
        @keyframes float3{0%,100%{transform:translateY(0) rotate(-.3deg)}50%{transform:translateY(-10px) rotate(.3deg)}}
        @keyframes scan{0%,100%{width:0%;opacity:1}50%{width:90%;opacity:.7}100%{width:100%;opacity:0}}
        .sr-el{opacity:0;transform:translateY(36px);transition:opacity .7s ease,transform .7s ease}
        .sr-el.sr-vis{opacity:1;transform:translateY(0)}
        .sr-d1{transition-delay:.1s}.sr-d2{transition-delay:.2s}.sr-d3{transition-delay:.3s}.sr-d4{transition-delay:.4s}.sr-d5{transition-delay:.5s}
        .hero-h1{opacity:0;animation:fadeUp .6s .1s ease both}
        .hero-h2{opacity:0;animation:fadeUp .6s .2s ease both}
        .hero-h3{opacity:0;animation:fadeUp .6s .3s ease both}
        .hero-sub{opacity:0;animation:fadeUp .6s .4s ease both}
        .hero-cta{opacity:0;animation:fadeUp .6s .5s ease both}
        .hero-stats{opacity:0;animation:fadeUp .6s .6s ease both}
        .hero-badge{animation:fadeUp .6s ease both}
        .bc-glow{transition:border-color .3s,transform .3s,box-shadow .3s,background .35s}
        .ag-scan{height:2px;border-radius:2px;background:linear-gradient(90deg,#10b981,transparent);animation:scan 2.5s ease-in-out infinite;transform-origin:left}
        @media(max-width:768px){#hcanvas{display:none}#em-cursor,#em-cursor-ring{display:none}}
      `}</style>
    </>
  )
}

