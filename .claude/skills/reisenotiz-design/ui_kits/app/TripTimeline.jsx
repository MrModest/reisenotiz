// TripTimeline.jsx — Trip timeline screen with vertical timeline

function TripTimeline({ setScreen, setSelectedItem, trip, onAddItem }) {
  const items = trip?.items || []

  return (
    <div style={{position:'relative', paddingTop:8}}>
      {items.length === 0 && (        <div style={{textAlign:'center', padding:'32px 16px', color:'var(--muted-fg)', font:'var(--text-body)'}}>No timeline items to display</div>
      )}
      <ol style={{listStyle:'none', margin:0, padding:0, display:'flex', flexDirection:'column', gap:0}}>
        {items.map((item, i) => (
          <TimelineItem key={item.id} item={item} isLast={i === items.length-1}
            onClick={() => { setSelectedItem(item); setScreen(item.type) }} />
        ))}
      </ol>
      {/* FAB */}
      <button style={{position:'fixed', bottom:72, right:16, width:48, height:48, borderRadius:6, background:'var(--primary)', border:'none', color:'white', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 12px oklch(0.6397 0.172 36.44 / 0.4)', zIndex:40, transition:'transform 120ms'}}
        onMouseEnter={e=>e.currentTarget.style.transform='scale(1.08)'}
        onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}
        onClick={onAddItem}>
        <i data-lucide="circle-plus" style={{width:22,height:22}}></i>
      </button>
    </div>
  )
}

function TimelineItem({ item, isLast, onClick }) {
  const [hovered, setHovered] = React.useState(false)
  const iconMap = { flight: 'plane', hotel: 'bed' }
  const lucideIcon = iconMap[item.type] || 'circle'

  return (
    <li style={{display:'grid', gridTemplateColumns:'80px 40px 1fr', gap:6, alignItems:'start', marginBottom: isLast ? 0 : 0}}>
      {/* Date/time */}
      <div style={{textAlign:'right', paddingTop:6}}>
        <div style={{font:'var(--text-micro)', color:'var(--muted-fg)', whiteSpace:'nowrap'}}>{item.date}</div>
        <div style={{font:'var(--text-time)', color:'var(--primary)'}}>{item.time}</div>
      </div>
      {/* Dot + connector */}
      <div style={{display:'flex', flexDirection:'column', alignItems:'center', paddingTop:6}}>
        <div style={{width:36,height:36,borderRadius:4,background:'var(--primary)',border:'2px solid oklch(0.6397 0.172 36.44 / 0.35)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,zIndex:1}}>
          <i data-lucide={lucideIcon} style={{width:16,height:16,color:'white'}}></i>
        </div>
        {!isLast && <div style={{width:2,background:'var(--border)',flex:1,minHeight:32,marginTop:4}}></div>}
      </div>
      {/* Content card */}
      <div onClick={onClick} onMouseEnter={()=>setHovered(true)} onMouseLeave={()=>setHovered(false)}
        style={{background: hovered ? 'var(--accent)' : 'var(--card)', borderRadius:'var(--r-lg)', padding:'10px 12px', marginBottom:16, cursor:'pointer', transition:'all 120ms', transform: hovered ? 'scale(1.01)' : 'scale(1)'}}>
        <div style={{font:'var(--text-itemtitle)', color: hovered ? 'var(--accent-fg)' : 'var(--fg)', marginBottom:2}}>{item.title}</div>
        <div style={{font:'var(--text-micro)', color: hovered ? 'var(--accent-fg)' : 'var(--muted-fg)'}}>{item.desc}</div>
      </div>
    </li>
  )
}

Object.assign(window, { TripTimeline, TimelineItem })
