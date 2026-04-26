// TripList.jsx — Trips list screen

function TripList({ setScreen, trips, setSelectedTrip, onCreateTrip }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:6, paddingTop:4}}>
      {/* New trip button */}
      <button onClick={onCreateTrip}
        style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px dashed var(--border)', background:'transparent', color:'var(--muted-fg)', cursor:'pointer', width:'100%', font:'var(--text-ui)', transition:'all 100ms', textAlign:'left'}}
        onMouseEnter={e => { e.currentTarget.style.background='var(--accent)'; e.currentTarget.style.color='var(--accent-fg)' }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='var(--muted-fg)' }}>
        <i data-lucide="circle-plus" style={{width:16,height:16, flexShrink:0}}></i>
        New Trip
      </button>

      {trips.map(trip => (
        <TripCard key={trip.id} trip={trip} onClick={() => { setSelectedTrip(trip); setScreen('timeline') }} />
      ))}
    </div>
  )
}

function TripCard({ trip, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  return (
    <div onClick={onClick}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:'var(--r-md)', border:'1px solid var(--border)', background: hovered ? 'var(--accent)' : 'var(--card)', color: hovered ? 'var(--accent-fg)' : 'var(--fg)', cursor:'pointer', transition:'all 120ms', transform: hovered ? 'scale(1.01)' : 'scale(1)'}}>
      <div style={{width:32,height:32,borderRadius:4,background:'var(--primary)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
        <i data-lucide="tickets-plane" style={{width:15,height:15,color:'white'}}></i>
      </div>
        <div style={{flex:1, display:'flex', flexDirection:'column', gap:2, minWidth:0}}>
        <div style={{font:'var(--text-ui)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap'}}>{trip.name}</div>
        <div style={{font:'var(--text-micro)', color: hovered ? 'var(--accent-fg)' : 'var(--muted-fg)'}}>{trip.dates}</div>
      </div>
      <button onClick={e => e.stopPropagation()}
        style={{width:24,height:24,borderRadius:'var(--r-sm)',border:'none',background:'transparent',cursor:'pointer',color: hovered ? 'var(--accent-fg)' : 'var(--muted-fg)',display:'flex',alignItems:'center',justifyContent:'center', flexShrink:0}}
        onMouseEnter={e => { e.currentTarget.style.background='var(--destructive-bg)'; e.currentTarget.style.color='var(--destructive)' }}
        onMouseLeave={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='' }}>
        <i data-lucide="trash-2" style={{width:13,height:13}}></i>
      </button>
    </div>
  )
}

Object.assign(window, { TripList, TripCard })
