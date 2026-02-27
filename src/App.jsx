import { useEffect, useMemo, useRef, useState } from 'react'

const teamMembers = [
  {
    name: 'Neville Akoragye',
    role: 'Team Lead & Founder',
    skills: ['Project management', 'React (JS / TSX)', 'Vite'],
    githubs: [
      { label: '@neville03', url: 'https://github.com/neville03' },
      { label: '@neville04', url: 'https://github.com/neville04' },
    ],
    photo: '/neville.JPG',
  },
]

const encode = (data) =>
  Object.entries(data)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`)
    .join('&')

function App() {
  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [typing, setTyping] = useState(false)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi — what are you looking to build?' },
  ])
  const [submitStatus, setSubmitStatus] = useState('idle')
  const chatListRef = useRef(null)
  const workGridRef = useRef(null)
  const replyTimeoutRef = useRef(null)
  const scrollWork = (direction) => {
    if (!workGridRef.current) return
    const scrollAmount = workGridRef.current.clientWidth * 0.85
    workGridRef.current.scrollBy({ left: scrollAmount * direction, behavior: 'smooth' })
  }

  const botReplies = useMemo(
    () => ({
      pricing:
        "Projects start from $500. We'll give you an exact quote once we understand your scope — submit the brief above.",
      timeline:
        'Simple sites take 1–2 weeks. Full apps take 4–8 weeks. Your exact timeline will be in the proposal.',
      hello: 'Hi there. What are you looking to build with Gracen Studio?',
      services:
        'We build web apps, mobile apps, SaaS platforms, UI/UX design, e-commerce, and motion graphics.',
      fallback: [
        "The best step is to fill in the project brief above — we respond within 24 hours.",
        "Sounds interesting. Submit the brief and our team will review it and get back to you.",
        "Tell us more via the project brief — we'd love to hear what you're building.",
      ],
    }),
    [],
  )

  useEffect(() => {
    const cur = document.getElementById('cur')
    const ring = document.getElementById('ring')

    if (!cur || !ring) {
      return undefined
    }

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = window.innerWidth / 2
    let ringY = window.innerHeight / 2
    let animationFrame = null

    cur.style.left = `${mouseX}px`
    cur.style.top = `${mouseY}px`
    ring.style.left = `${ringX}px`
    ring.style.top = `${ringY}px`

    const onMouseMove = (event) => {
      mouseX = event.clientX
      mouseY = event.clientY
      cur.style.left = `${mouseX}px`
      cur.style.top = `${mouseY}px`
    }

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.1
      ringY += (mouseY - ringY) * 0.1
      ring.style.left = `${ringX}px`
      ring.style.top = `${ringY}px`

      const hovered = document.elementFromPoint(mouseX, mouseY)
      const isInteractive = hovered?.closest('a, button')

      ring.style.width = isInteractive ? '52px' : '36px'
      ring.style.height = isInteractive ? '52px' : '36px'
      ring.style.borderColor = isInteractive ? 'var(--teal)' : 'var(--ink)'

      animationFrame = requestAnimationFrame(animateRing)
    }

    document.addEventListener('mousemove', onMouseMove)
    animationFrame = requestAnimationFrame(animateRing)

    return () => {
      document.removeEventListener('mousemove', onMouseMove)
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 },
    )

    const revealItems = document.querySelectorAll('.rv')
    revealItems.forEach((item) => observer.observe(item))

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (chatListRef.current) {
      chatListRef.current.scrollTop = chatListRef.current.scrollHeight
    }
  }, [messages, typing])

  useEffect(() => {
    return () => {
      if (replyTimeoutRef.current) {
        clearTimeout(replyTimeoutRef.current)
      }
    }
  }, [])

  const getReply = (text) => {
    const message = text.toLowerCase()
    if (/hi|hello|hey/.test(message)) return botReplies.hello
    if (/price|cost|how much|\$/.test(message)) return botReplies.pricing
    if (/time|long|week|when|fast/.test(message)) return botReplies.timeline
    if (/service|build|make|app|site|web|develop/.test(message)) {
      return botReplies.services
    }
    const randomIndex = Math.floor(Math.random() * botReplies.fallback.length)
    return botReplies.fallback[randomIndex]
  }

  const sendMessage = () => {
    const text = chatInput.trim()
    if (!text || typing) return

    setMessages((prev) => [...prev, { from: 'user', text }])
    setChatInput('')
    setTyping(true)

    replyTimeoutRef.current = setTimeout(() => {
      setMessages((prev) => [...prev, { from: 'bot', text: getReply(text) }])
      setTyping(false)
    }, 1400)
  }

  const submitBrief = (event) => {
    event.preventDefault()
    if (submitStatus === 'submitting') return

    const form = event.currentTarget
    const formData = new FormData(form)
    if (formData.get('bot-field')) {
      return
    }

    const name = formData.get('name')?.toString().trim() || ''
    const email = formData.get('email')?.toString().trim() || ''
    const company = formData.get('company')?.toString().trim() || ''
    const service = formData.get('service')?.toString().trim() || ''
    const budget = formData.get('budget')?.toString().trim() || ''
    const brief = formData.get('brief')?.toString().trim() || ''

    setSubmitStatus('submitting')

    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode({
        'form-name': 'project-brief',
        name,
        email,
        company,
        service,
        budget,
        brief,
      }),
    })
      .then(() => {
        form.reset()
        setSubmitStatus('success')
      })
      .catch(() => {
        setSubmitStatus('error')
      })
  }

  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <div className="cursor" id="cur"></div>
      <div className="cursor-ring" id="ring"></div>

      <nav>
        <a href="#" className="nav-logo">
          Gracen <em>Studio</em>
        </a>
        <div className="nav-right">
          <ul className="nav-links">
            <li>
              <a href="#services">Services</a>
            </li>
            <li>
              <a href="#work">Work</a>
            </li>
            <li>
              <a href="#team">Team</a>
            </li>
            <li>
              <a href="#pricing">Pricing</a>
            </li>
          </ul>
          <a href="#booking" className="nav-cta">
            Start a project
          </a>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-carousel" aria-hidden="true">
          <div className="hero-carousel-track">
            <img src="/hero_image1.webp" alt="" className="hero-carousel-image" />
            <img src="/hero_image2.png" alt="" className="hero-carousel-image" />
            <video className="hero-carousel-video" autoPlay muted loop playsInline preload="metadata">
              <source src="/hero_video.mp4" type="video/mp4" />
            </video>
            <img src="/hero_image1.webp" alt="" className="hero-carousel-image" />
            <img src="/hero_image2.png" alt="" className="hero-carousel-image" />
            <video className="hero-carousel-video" autoPlay muted loop playsInline preload="metadata">
              <source src="/hero_video.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <div className="hero-overlay" aria-hidden="true"></div>
        <div className="hero-index">Uganda · Est. 2025</div>
        <div className="hero-split">
          <div className="hero-left">
            <div className="hero-panel">
              <div className="hero-bg-word">Gracen</div>
              <h1 className="hero-title">
                We build
                <br />
                <em>better</em>
                <span className="hero-software">software.</span>
              </h1>
              <div className="hero-bottom">
                <p className="hero-desc">
                  Design, development, and motion — under one roof. For entrepreneurs, startups,
                  and organisations who refuse to settle.
                </p>
                <div className="hero-actions">
                  <a href="#booking" className="btn-main">
                    Start a project →
                  </a>
                  <a href="#work" className="btn-ghost">
                    See our work →
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-right" aria-hidden="true"></div>
        </div>
        <div className="hero-scroll">Scroll</div>
      </section>

      <div className="ticker">
        <div className="ticker-track">
          <div className="ti">
            <span className="td"></span>
            <strong>Web Applications</strong>
          </div>
          <div className="ti">
            <span className="td"></span>Mobile Apps
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>UI / UX Design</strong>
          </div>
          <div className="ti">
            <span className="td"></span>SaaS Platforms
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>Motion & Animation</strong>
          </div>
          <div className="ti">
            <span className="td"></span>E-Commerce
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>Brand Identity</strong>
          </div>
          <div className="ti">
            <span className="td"></span>Custom Software
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>Web Applications</strong>
          </div>
          <div className="ti">
            <span className="td"></span>Mobile Apps
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>UI / UX Design</strong>
          </div>
          <div className="ti">
            <span className="td"></span>SaaS Platforms
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>Motion & Animation</strong>
          </div>
          <div className="ti">
            <span className="td"></span>E-Commerce
          </div>
          <div className="ti">
            <span className="td"></span>
            <strong>Brand Identity</strong>
          </div>
          <div className="ti">
            <span className="td"></span>Custom Software
          </div>
        </div>
      </div>

      <section className="s" id="about">
        <div className="about-grid">
          <div className="rv">
            <div className="s-label">Who we are</div>
            <h2 className="s-title">
              One studio.
              <br />
              <em>Every</em> capability.
            </h2>
            <p className="about-body">
              Gracen Studio exists for people with a vision who need a team to execute it. We bring
              together <strong>designers, developers, and motion artists</strong> who care deeply
              about craft — working as one unit from brief to launch.
              <br />
              <br />
              No handoffs. No miscommunication. Just a focused team that delivers.
            </p>
          </div>
          <div className="rv d2">
            <div className="stat-row">
              <div className="stat-n">
                3<sup>×</sup>
              </div>
              <div className="stat-t">
                Design, development and motion — handled together, never apart
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-n">$500</div>
              <div className="stat-t">
                Projects start here. Accessible for startups, scalable for enterprises
              </div>
            </div>
            <div className="stat-row">
              <div className="stat-n">
                100<sup>%</sup>
              </div>
              <div className="stat-t">
                Custom built from scratch — every project, every time
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="s" id="team">
        <div className="s-label rv">Team</div>
        <h2 className="s-title rv d1">
          People behind
          <br />
          <em>Gracen Studio</em>
        </h2>
        <div className="team-grid">
          {teamMembers.map((member) => (
            <div className="tm-card rv d1" key={member.name}>
              <div className="tm-photo">
                <img src={member.photo} alt={`Portrait of ${member.name}`} loading="lazy" />
              </div>
              <div className="tm-info">
                <div className="tm-name">{member.name}</div>
                <div className="tm-role">{member.role}</div>
                <ul className="tm-skills">
                  {member.skills.map((skill) => (
                    <li key={`${member.name}-${skill}`}>{skill}</li>
                  ))}
                </ul>
                <div className="tm-links">
                  {member.githubs.map((profile) => (
                    <a key={profile.url} href={profile.url} target="_blank" rel="noreferrer">
                      {profile.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="s dark-bg" id="services">
        <div className="sv-header">
          <div>
            <div className="s-label">Services</div>
            <h2 className="s-title rv" style={{ color: 'white' }}>
              What we
              <br />
              <em>build</em>
            </h2>
          </div>
          <p className="sv-sub rv d2">
            Everything your business needs to go digital — no need to manage multiple vendors.
          </p>
        </div>
        <div className="sv-list">
          <div className="sv-row rv">
            <div className="sv-n">01</div>
            <div className="sv-name">Web Applications</div>
            <div className="sv-desc">
              Custom websites and web apps built for performance, conversion, and growth.
            </div>
            <div className="sv-tag">From $500</div>
          </div>
          <div className="sv-row rv d1">
            <div className="sv-n">02</div>
            <div className="sv-name">Mobile Apps</div>
            <div className="sv-desc">
              iOS and Android experiences your users will love — beautiful and functional.
            </div>
            <div className="sv-tag">iOS & Android</div>
          </div>
          <div className="sv-row rv d2">
            <div className="sv-n">03</div>
            <div className="sv-name">UI / UX Design</div>
            <div className="sv-desc">
              Interfaces that are intuitive, beautiful, and designed to convert visitors.
            </div>
            <div className="sv-tag">Research-led</div>
          </div>
          <div className="sv-row rv d3">
            <div className="sv-n">04</div>
            <div className="sv-name">SaaS Platforms</div>
            <div className="sv-desc">
              End-to-end product development — dashboards, auth, billing, full stack.
            </div>
            <div className="sv-tag">Full-stack</div>
          </div>
          <div className="sv-row rv d4">
            <div className="sv-n">05</div>
            <div className="sv-name">Motion & Animation</div>
            <div className="sv-desc">
              Product animations and UI motion that make your product feel premium.
            </div>
            <div className="sv-tag">After Effects</div>
          </div>
          <div className="sv-row rv">
            <div className="sv-n">06</div>
            <div className="sv-name">E-Commerce</div>
            <div className="sv-desc">
              Online stores that turn browsers into buyers, built to scale with you.
            </div>
            <div className="sv-tag">Custom build</div>
          </div>
        </div>
      </section>

      <section className="s" id="work" style={{ paddingBottom: '48px' }}>
        <div className="s-label rv">Selected work</div>
        <h2 className="s-title rv d1">
          Projects that
          <br />
          speak for <em>themselves</em>
        </h2>
      </section>
      <div className="work-gallery">
        <button
          type="button"
          className="work-scroll prev"
          aria-label="Scroll projects left"
          onClick={() => scrollWork(-1)}
        >
          ←
        </button>
        <div className="work-grid" ref={workGridRef}>
          <div className="wi wi-project1">
          <a
            href="https://www.pistanero.store"
            target="_blank"
            rel="noreferrer"
            className="wi-inner wi-link"
          >
            <video className="wi-video-bg" autoPlay muted loop playsInline preload="metadata">
              <source src="/pistanero.mp4" type="video/mp4" />
            </video>
            <div className="wi-ov"></div>
            <div className="wi-meta">
              <div className="wi-cat">Sports Recreation Club</div>
              <div className="wi-title">How we built Pistanero&apos;s digital experience</div>
            </div>
            <div className="wi-badge">Click to view ↗</div>
          </a>
        </div>
          <div className="wi wi-eventbridge">
            <a
              href="https://www.eventbridge.africa/"
              target="_blank"
              rel="noreferrer"
              className="wi-inner wi-link"
            >
              <video className="wi-video-bg" autoPlay muted loop playsInline preload="metadata">
                <source src="/eventbridge.mp4" type="video/mp4" />
              </video>
              <div className="wi-ov"></div>
              <div className="wi-meta">
                <div className="wi-cat">Event Production</div>
                <div className="wi-title">How we built an event masterpiece</div>
              </div>
              <div className="wi-badge">Click to view more ↗</div>
            </a>
          </div>
          <div className="wi">
            <div className="wi-inner">
              <video className="wi-video-bg" autoPlay muted loop playsInline preload="metadata">
                <source src="/dashboard.mp4" type="video/mp4" />
              </video>
              <div className="wi-ov"></div>
              <div className="wi-meta">
                <div className="wi-cat">SaaS Platform</div>
                <div className="wi-title">Manage your business in one place</div>
              </div>
              <div className="wi-badge">Coming soon</div>
            </div>
          </div>
        </div>
        <button
          type="button"
          className="work-scroll next"
          aria-label="Scroll projects right"
          onClick={() => scrollWork(1)}
        >
          →
        </button>
      </div>

      <section className="s white-bg" id="process">
        <div className="s-label rv">How we work</div>
        <h2 className="s-title rv d1">
          A process built for
          <br />
          <em>results</em>
        </h2>
        <div className="proc-grid">
          <div className="pc rv">
            <div className="pc-n">01</div>
            <div className="pc-t">Discovery</div>
            <p className="pc-d">
              We deeply understand your business, users, and the real problem before anything else.
            </p>
          </div>
          <div className="pc rv d1">
            <div className="pc-n">02</div>
            <div className="pc-t">Design</div>
            <p className="pc-d">
              UI/UX design comes first — wireframes, prototypes, and a full design system before
              code.
            </p>
          </div>
          <div className="pc rv d2">
            <div className="pc-n">03</div>
            <div className="pc-t">Build</div>
            <p className="pc-d">
              Development starts from approved designs. Weekly updates and live previews throughout.
            </p>
          </div>
          <div className="pc rv d3">
            <div className="pc-n">04</div>
            <div className="pc-t">Launch</div>
            <p className="pc-d">
              Deployment, testing, and handover. Post-launch support included — you&apos;re never
              stranded.
            </p>
          </div>
        </div>
      </section>

      <section className="s" id="pricing" style={{ background: '#FAFAF8' }}>
        <div className="s-label rv">Pricing</div>
        <h2 className="s-title rv d1">
          Transparent.
          <br />
          <em>No surprises.</em>
        </h2>
        <div className="pr-grid">
          <div className="pr-card rv">
            <div className="pr-plan">Starter</div>
            <div className="pr-amt">
              <sup>$</sup>500
            </div>
            <div className="pr-from">starting from</div>
            <div className="pr-line"></div>
            <ul className="pr-list">
              <li>Landing page or simple web app</li>
              <li>UI/UX design included</li>
              <li>Mobile responsive</li>
              <li>2 revision rounds</li>
              <li>Delivered in 1–2 weeks</li>
            </ul>
            <button className="pr-btn" onClick={scrollToBooking}>
              Get a quote
            </button>
          </div>
          <div className="pr-card hl rv d1">
            <div className="pr-badge">Popular</div>
            <div className="pr-plan">Growth</div>
            <div className="pr-amt">
              <sup>$</sup>2k
            </div>
            <div className="pr-from">starting from</div>
            <div className="pr-line"></div>
            <ul className="pr-list">
              <li>Full web or mobile application</li>
              <li>Custom UI/UX design system</li>
              <li>Backend & database</li>
              <li>Admin dashboard included</li>
              <li>3 months post-launch support</li>
            </ul>
            <button className="pr-btn" onClick={scrollToBooking}>
              Start a project
            </button>
          </div>
          <div className="pr-card rv d2">
            <div className="pr-plan">Enterprise</div>
            <div className="pr-amt" style={{ fontSize: '38px', paddingTop: '10px' }}>
              Custom
            </div>
            <div className="pr-from">scoped per project</div>
            <div className="pr-line"></div>
            <ul className="pr-list">
              <li>End-to-end product development</li>
              <li>Dedicated project team</li>
              <li>SLA & priority support</li>
              <li>API & system integrations</li>
              <li>Ongoing maintenance retainer</li>
            </ul>
            <button className="pr-btn" onClick={scrollToBooking}>
              Get in touch
            </button>
          </div>
        </div>
      </section>

      <section className="s" id="booking" style={{ background: 'white' }}>
        <div className="s-label rv">Start a project</div>
        <h2 className="s-title rv d1">
          Tell us what you&apos;re
          <br />
          <em>building</em>
        </h2>
        <div className="bk-layout">
          <div className="rv d1">
            <p className="bk-note">
              Fill in the brief and we&apos;ll respond within 24 hours with a proposal, timeline,
              and exact quote. No commitment required.
            </p>
            <div className="bk-contacts">
              <a href="mailto:gracenstudio@gmail.com" className="bc">
                <div className="bc-icon">✉</div>
                gracenstudio@gmail.com
              </a>
              <a href="tel:+256700953462" className="bc">
                <div className="bc-icon">✆</div>
                +256 700 953 462
              </a>
            </div>
          </div>
          <div className="bk-form rv d2">
            <form
              name="project-brief"
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={submitBrief}
            >
              <input type="hidden" name="form-name" value="project-brief" />
              <div className="honeypot">
                <label>
                  Do not fill this out if you are human
                  <input name="bot-field" tabIndex="-1" autoComplete="off" />
                </label>
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label htmlFor="name">Name</label>
                  <input id="name" name="name" type="text" placeholder="Your name" required />
                </div>
                <div className="fg">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                  />
                </div>
              </div>
              <div className="fg">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  placeholder="Your business or company"
                />
              </div>
              <div className="fg-row">
                <div className="fg">
                  <label htmlFor="service">Service</label>
                  <select id="service" name="service" defaultValue="">
                    <option value="">Select one</option>
                    <option>Web Application</option>
                    <option>Mobile App</option>
                    <option>UI/UX Design</option>
                    <option>SaaS Platform</option>
                    <option>E-Commerce</option>
                    <option>Motion & Animation</option>
                    <option>Not sure yet</option>
                  </select>
                </div>
                <div className="fg">
                  <label htmlFor="budget">Budget</label>
                  <select id="budget" name="budget" defaultValue="">
                    <option value="">Select range</option>
                    <option>$500 – $1,000</option>
                    <option>$1,000 – $3,000</option>
                    <option>$3,000 – $10,000</option>
                    <option>$10,000+</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
              <div className="fg">
                <label htmlFor="brief">Project brief</label>
                <textarea
                  id="brief"
                  name="brief"
                  placeholder="What are you building? Who is it for? Any requirements?"
                ></textarea>
              </div>
              <button type="submit" className="f-sub" disabled={submitStatus === 'submitting'}>
                {submitStatus === 'submitting'
                  ? 'Sending…'
                  : submitStatus === 'success'
                    ? "✓ Received — we'll be in touch within 24 hours"
                    : 'Send brief →'}
              </button>
              {submitStatus === 'error' && (
                <p className="form-feedback error">
                  Something went wrong. Email gracenstudio@gmail.com while we fix this.
                </p>
              )}
              {submitStatus === 'success' && (
                <p className="form-feedback success">Thanks! We respond within 24 hours.</p>
              )}
            </form>
          </div>
        </div>
      </section>

      <footer>
        <div className="ft">
          <div className="f-logo">
            Gracen <em>Studio</em>
          </div>
          <div className="f-cols">
            <div className="f-col">
              <h5>Studio</h5>
              <a href="#about">About</a>
              <a href="#services">Services</a>
              <a href="#work">Work</a>
              <a href="#process">Process</a>
            </div>
            <div className="f-col">
              <h5>Project</h5>
              <a href="#pricing">Pricing</a>
              <a href="#booking">Start a project</a>
            </div>
            <div className="f-col">
              <h5>Contact</h5>
              <a href="mailto:gracenstudio@gmail.com">gracenstudio@gmail.com</a>
              <a href="tel:+256700953462">+256 700 953 462</a>
            </div>
          </div>
        </div>
        <div className="fb">
          <p className="fc">
            © {new Date().getFullYear()} <span>Gracen Studio</span>. All rights reserved.
          </p>
          <p className="fc">Crafting better experiences.</p>
        </div>
      </footer>

      <div className="cw">
        <div className={`cb ${chatOpen ? 'open' : ''}`} id="cb">
          <div className="ch">
            <h4>Gracen Studio AI</h4>
            <p>Replies instantly · 24/7</p>
          </div>
          <div className="cm-list" id="cms" ref={chatListRef}>
            {messages.map((message, index) => (
              <div key={`${message.from}-${index}`} className={`cm ${message.from === 'bot' ? 'b' : 'u'}`}>
                {message.text}
              </div>
            ))}
            {typing && (
              <div className="cm b ty">
                <span></span>
                <span></span>
                <span></span>
              </div>
            )}
          </div>
          <div className="ci">
            <input
              id="ci"
              placeholder="Ask anything..."
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  sendMessage()
                }
              }}
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
        <button className="ct" id="ctg" onClick={() => setChatOpen((prev) => !prev)}>
          {chatOpen ? '✕' : '✦'}
        </button>
      </div>
    </>
  )
}

export default App
