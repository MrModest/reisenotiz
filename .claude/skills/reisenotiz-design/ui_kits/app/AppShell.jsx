// AppShell.jsx — Layout shell with header, sidebar (desktop), bottom nav (mobile)

function AppShell({ screen, setScreen, children }) {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'house' },
    { id: 'trips', label: 'Trips', icon: 'tickets-plane' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ]
  const activeNav = ['home'].includes(screen) ? 'home' : ['settings'].includes(screen) ? 'settings' : 'trips'

  return (
    <div style={{display:'flex', height:'100%', background:'var(--bg)', font:'var(--text-ui)', color:'var(--fg)', overflow:'hidden'}}>
      {/* Desktop sidebar — shown at ≥768px via injected media query */}
      <aside style={{display:'none', flexDirection:'column', width:200, borderRight:'1px solid var(--border)', background:'var(--sidebar)', flexShrink:0, overflowY:'auto'}} className="desktop-sidebar">
        <div style={{padding:'12px 12px 8px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:8}}>
          <img src="../../assets/pwa-192x192.png" style={{width:24,height:24,borderRadius:4}} alt="logo" />
          <span style={{font:'var(--text-subtitle)'}}>Reisenotiz</span>
        </div>
        <nav style={{padding:8, display:'flex', flexDirection:'column', gap:4}}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => setScreen(item.id)}
              style={{display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:'var(--r-md)', border:'none', background: activeNav===item.id ? 'var(--accent)' : 'transparent', color: activeNav===item.id ? 'var(--accent-fg)' : 'var(--muted-fg)', cursor:'pointer', font:'var(--text-ui)', transition:'all 100ms', width:'100%', textAlign:'left'}}>
              <i data-lucide={item.icon} style={{width:16,height:16}}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div style={{flex:1, display:'flex', flexDirection:'column', overflow:'hidden', minWidth:0}}>
        <AppHeader screen={screen} setScreen={setScreen} />
        <div style={{flex:1, overflowY:'auto', overflowX:'hidden', paddingBottom:56}}>
          <div style={{padding:'8px 8px', maxWidth:480, margin:'0 auto'}}>
            {children}
          </div>
        </div>
        {/* Mobile bottom nav */}
        <nav style={{position:'fixed', bottom:0, left:0, right:0, height:56, borderTop:'1px solid var(--border)', background:'var(--bg)', display:'flex', justifyContent:'space-around', alignItems:'center', padding:'0 16px', zIndex:50}} className="mobile-nav">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setScreen(item.id)}
              style={{display:'flex', flexDirection:'column', alignItems:'center', gap:3, padding:'6px 12px', borderRadius:'var(--r-md)', border:'none', background:'transparent', color: activeNav===item.id ? 'var(--primary)' : 'var(--muted-fg)', cursor:'pointer', font:'var(--text-micro)', transition:'all 100ms'}}>
              <i data-lucide={item.icon} style={{width:18,height:18}}></i>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}

function AppHeader({ screen, setScreen }) {
  const titles = {
    home: { title: 'Reisenotiz', icon: 'logo' },
    trips: { title: 'Trips', icon: 'map' },
    timeline: { title: 'Trip to Japan', icon: 'map-pin' },
    flight: { title: 'Trip to Japan', icon: 'map-pin' },
    hotel: { title: 'Trip to Japan', icon: 'map-pin' },
    'flight-create': { title: 'Trip to Japan', icon: 'map-pin' },
    'hotel-create': { title: 'Trip to Japan', icon: 'map-pin' },
    'flight-edit': { title: 'Trip to Japan', icon: 'map-pin' },
    'hotel-edit': { title: 'Trip to Japan', icon: 'map-pin' },
    settings: { title: 'Settings', icon: 'settings' },
    newtrip: { title: 'New Trip', icon: 'plus' },
  }
  const { title, icon } = titles[screen] || titles.home
  const canGoBack = ['timeline','flight','hotel','flight-create','hotel-create','flight-edit','hotel-edit'].includes(screen)
  const backTo = { timeline: 'trips', flight: 'timeline', hotel: 'timeline', 'flight-create': 'timeline', 'hotel-create': 'timeline', 'flight-edit': 'flight', 'hotel-edit': 'hotel' }

  return (
    <header style={{borderBottom:'1px solid var(--border)', background:'var(--bg)', padding:'0 12px', height:48, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0, position:'sticky', top:0, zIndex:10}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        {canGoBack ? (
          <button onClick={() => setScreen(backTo[screen])}
            style={{width:28,height:28,borderRadius:'var(--r-md)',border:'none',background:'transparent',cursor:'pointer',color:'var(--fg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i data-lucide="chevron-left" style={{width:16,height:16}}></i>
          </button>
        ) : (
          <img src="../../assets/pwa-192x192.png" style={{width:22,height:22,borderRadius:4}} alt="logo" />
        )}
        <span style={{font:'var(--text-subtitle)'}}>{title}</span>
      </div>
      <div style={{display:'flex', gap:6}}>
        {screen === 'settings' && (
          <button style={{width:28,height:28,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',color:'var(--fg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i data-lucide="sun" style={{width:14,height:14}}></i>
          </button>
        )}
      </div>
    </header>
  )
}

Object.assign(window, { AppShell, AppHeader })
