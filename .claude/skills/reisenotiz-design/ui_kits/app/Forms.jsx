// Forms.jsx — Flight and Hotel create/edit form screens (matched to real app)

function FlightForm({ item, isCreate, setScreen }) {
  const [flightNo, setFlightNo] = React.useState(item?.flightNo || 'FC3030')
  const [airline, setAirline] = React.useState(item?.airline || 'Fictional Air')
  const [booking, setBooking] = React.useState(item?.booking || 'XY99ZZ')
  const [seat, setSeat] = React.useState(item?.seat || '14A')
  const [note, setNote] = React.useState('Very long and complex note.')
  const [depOpen, setDepOpen] = React.useState(false)
  const [arrOpen, setArrOpen] = React.useState(false)
  const [passOpen, setPassOpen] = React.useState(false)
  const [attOpen, setAttOpen] = React.useState(false)

  return (
    <div style={{paddingTop:4, paddingBottom:40}}>
      {/* Flight No + Airline */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        <FlatField label="Flight Number" value={flightNo} onChange={setFlightNo} placeholder="FC3030" />
        <FlatField label="Airline" value={airline} onChange={setAirline} placeholder="Airline" />
      </div>

      {/* Departure section card */}
      <SectionCard
        icon="plane-takeoff" label="Departure"
        open={depOpen} onToggle={() => setDepOpen(o=>!o)}
        preview={
          <div style={{padding:'10px 12px'}}>
            <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
              <span style={{fontSize:'1.1rem', lineHeight:1}}>🇩🇪</span>
              <div>
                <div style={{fontSize:'0.75rem', fontWeight:500, color:'var(--fg)'}}>Berlin Brandenburg Airport (BER)</div>
                <div style={{fontSize:'0.7rem', color:'var(--muted-fg)', marginTop:2}}>Dec 01, 2025 · 19:00 · Europe/Berlin</div>
              </div>
            </div>
          </div>
        }>
        <AirportPointForm
          point={{code:'BER', airport:'Berlin Brandenburg Airport', date:'2025-12-01', time:'19:00', terminal:'T1', gate:'B22'}}
          flag="🇩🇪" />
      </SectionCard>

      {/* Arrival section card */}
      <SectionCard
        icon="plane-landing" label="Arrival"
        open={arrOpen} onToggle={() => setArrOpen(o=>!o)}
        preview={
          <div style={{padding:'10px 12px'}}>
            <div style={{display:'flex', alignItems:'flex-start', gap:8}}>
              <span style={{fontSize:'1.1rem', lineHeight:1}}>🇯🇵</span>
              <div>
                <div style={{fontSize:'0.75rem', fontWeight:500, color:'var(--fg)'}}>Tokyo Haneda Airport (HND)</div>
                <div style={{fontSize:'0.7rem', color:'var(--muted-fg)', marginTop:2}}>Dec 02, 2025 · 15:00 · Asia/Tokyo</div>
              </div>
            </div>
          </div>
        }>
        <AirportPointForm
          point={{code:'HND', airport:'Tokyo Haneda Airport', date:'2025-12-02', time:'15:00', terminal:'T3', gate:''}}
          flag="🇯🇵" />
      </SectionCard>

      <RnSeparator />

      {/* Booking + Seat */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        <FlatField label="Booking" value={booking} onChange={setBooking} placeholder="XY99ZZ" />
        <FlatField label="Seat(s)" value={seat} onChange={setSeat} placeholder="14A" />
      </div>

      {/* Note section card */}
      <SectionCard icon="file-text" label="Note" open={true} onToggle={()=>{}} noToggle>
        <div style={{padding:'10px 12px'}}>
          <p style={{margin:0, fontSize:'0.75rem', color:'var(--fg)'}}>{note}</p>
        </div>
      </SectionCard>

      {/* Passengers section */}
      <SectionCard icon="user" label="Passengers (3)" open={passOpen} onToggle={() => setPassOpen(o=>!o)} />

      {/* Attachments section */}
      <SectionCard icon="paperclip" label="Attachments (1)" open={attOpen} onToggle={() => setAttOpen(o=>!o)} />

      <RnSeparator style={{margin:'16px 0 12px'}} />

      {/* Full-width Save + Cancel */}
      <FullWidthBtn variant="primary">Save</FullWidthBtn>
      <FullWidthBtn variant="secondary" style={{marginTop:6}} onClick={() => setScreen('timeline')}>Cancel</FullWidthBtn>
    </div>
  )
}

function HotelForm({ item, isCreate, setScreen }) {
  const [guests, setGuests] = React.useState('3')
  const [rooms, setRooms] = React.useState('1')
  const [reservedBy, setReservedBy] = React.useState('Max Mustermann')
  const [stayOpen, setStayOpen] = React.useState(false)
  const [noteOpen, setNoteOpen] = React.useState(false)
  const [attOpen, setAttOpen] = React.useState(false)

  return (
    <div style={{paddingTop:4, paddingBottom:40}}>
      {/* Header row */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14}}>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <i data-lucide="bed" style={{width:18,height:18,color:'var(--primary)'}}></i>
          <span style={{fontWeight:700, fontSize:'1rem', color:'var(--fg)'}}>{isCreate ? 'New Accommodation' : 'Edit Accommodation'}</span>
        </div>
        <div style={{display:'flex', gap:5}}>
          <IconBtn icon="save" />
          <IconBtn icon="ban" onClick={() => setScreen('timeline')} />
        </div>
      </div>

      {/* Site combobox */}
      <div style={{display:'flex', gap:6, marginBottom:8, alignItems:'center'}}>
        <div style={{flex:1, display:'flex', alignItems:'center', background:'var(--card)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', padding:'0 10px', height:36}}>
          <span style={{flex:1, fontSize:'0.75rem', fontWeight:500, color:'var(--fg)'}}>NH Leipzig Messe</span>
          <i data-lucide="x" style={{width:14,height:14,color:'var(--muted-fg)',cursor:'pointer'}}></i>
        </div>
        <button style={{display:'flex', alignItems:'center', gap:5, padding:'0 10px', height:36, borderRadius:'var(--r-md)', border:'1px solid var(--border)', background:'transparent', color:'var(--fg)', fontSize:'0.75rem', fontWeight:500, fontFamily:'Inter,sans-serif', cursor:'pointer', whiteSpace:'nowrap'}}>
          <i data-lucide="square-pen" style={{width:13,height:13}}></i>
          Edit
        </button>
      </div>

      {/* Site preview */}
      <div style={{display:'flex', alignItems:'flex-start', gap:8, marginBottom:12}}>
        <span style={{fontSize:'1.1rem', lineHeight:1, marginTop:1}}>🇩🇪</span>
        <div>
          <div style={{display:'flex', alignItems:'center', gap:6}}>
            <span style={{fontSize:'0.65rem', fontWeight:500, color:'var(--muted-fg)', background:'var(--secondary)', borderRadius:'var(--r-sm)', padding:'1px 5px'}}>Hotel</span>
            <span style={{fontSize:'0.75rem', fontWeight:600, color:'var(--fg)'}}>NH Leipzig Messe</span>
          </div>
          <div style={{fontSize:'0.7rem', color:'var(--muted-fg)', marginTop:2}}>Dummy-hotel-straße 345, 12345 Leipzig · Germany</div>
        </div>
      </div>

      <RnSeparator />

      {/* Reserved By + Guests + Rooms */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 80px 80px', gap:8, marginBottom:12}}>
        <FlatField label="Reserved By" value={reservedBy} onChange={setReservedBy} placeholder="Name" />
        <FlatField label="Guests" value={guests} onChange={setGuests} type="number" />
        <FlatField label="Rooms" value={rooms} onChange={setRooms} type="number" />
      </div>

      {/* Stay Interval section */}
      <SectionCard
        icon="bed" label="Stay Interval"
        open={stayOpen} onToggle={() => setStayOpen(o=>!o)}
        preview={
          <div style={{padding:'10px 12px', display:'flex', flexDirection:'column', gap:4}}>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <i data-lucide="log-in" style={{width:14,height:14,color:'oklch(0.6 0.15 145)'}}></i>
              <span style={{fontSize:'0.75rem', color:'var(--fg)'}}>Mar 12, 2025 · 20:00</span>
            </div>
            <div style={{display:'flex', alignItems:'center', gap:8}}>
              <i data-lucide="log-out" style={{width:14,height:14,color:'oklch(0.6 0.2 25)'}}></i>
              <span style={{fontSize:'0.75rem', color:'var(--fg)'}}>Mar 13, 2025 · 10:00</span>
            </div>
          </div>
        }>
        <div style={{padding:'10px 12px', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
          <FlatField label="Check-in Date" value="2025-03-12" onChange={()=>{}} type="date" />
          <FlatField label="Check-in Time" value="20:00" onChange={()=>{}} type="time" />
          <FlatField label="Check-out Date" value="2025-03-13" onChange={()=>{}} type="date" />
          <FlatField label="Check-out Time" value="10:00" onChange={()=>{}} type="time" />
        </div>
      </SectionCard>

      {/* Note section */}
      <SectionCard icon="file-text" label="Note" open={true} onToggle={()=>{}} noToggle>
        <div style={{padding:'10px 12px'}}>
          <p style={{margin:0, fontSize:'0.75rem', color:'var(--fg)'}}>notify hotel that we come late 123</p>
        </div>
      </SectionCard>

      {/* Attachments */}
      <SectionCard icon="paperclip" label="Attachments (5)" open={attOpen} onToggle={() => setAttOpen(o=>!o)} />

      <RnSeparator style={{margin:'16px 0 12px'}} />

      <FullWidthBtn variant="primary">Save</FullWidthBtn>
      <FullWidthBtn variant="secondary" style={{marginTop:6}} onClick={() => setScreen('timeline')}>Cancel</FullWidthBtn>
    </div>
  )
}

// ─── Shared primitives ───────────────────────────────────────────────────────

function SectionCard({ icon, label, open, onToggle, noToggle, preview, children }) {
  return (
    <div style={{marginBottom:8}}>
      <div style={{background:'var(--card)', border:'1px solid var(--border)', borderRadius: open && children ? 'var(--r-md) var(--r-md) 0 0' : 'var(--r-md)', overflow:'hidden'}}>
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', padding:'9px 12px', cursor: noToggle ? 'default' : 'pointer'}} onClick={noToggle ? undefined : onToggle}>
          <div style={{display:'flex', alignItems:'center', gap:8}}>
            {icon && <i data-lucide={icon} style={{width:14,height:14,color:'var(--muted-fg)'}}></i>}
            <span style={{fontSize:'0.75rem', fontWeight:500, color:'var(--fg)'}}>{label}</span>
          </div>
          {!noToggle && <i data-lucide="square-pen" style={{width:14,height:14,color:'var(--muted-fg)'}}></i>}
        </div>
        {!open && preview}
      </div>
      {open && children && (
        <div style={{border:'1px solid var(--border)', borderTop:'none', borderRadius:'0 0 var(--r-md) var(--r-md)', background:'var(--card)'}}>
          {children}
        </div>
      )}
    </div>
  )
}

function FlatField({ label, value, onChange, placeholder, type='text', style }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:3, ...style}}>
      <label style={{fontSize:'0.7rem', fontWeight:500, color:'var(--muted-fg)'}}>{label}</label>
      <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
        style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',font:'500 0.75rem/1.4 Inter,sans-serif',color:'var(--fg)',padding:'0.375rem 0.625rem',height:'2rem',width:'100%',boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif'}}
        onFocus={e=>{e.target.style.borderColor='var(--ring)'}}
        onBlur={e=>{e.target.style.borderColor='var(--border)'}} />
    </div>
  )
}

function AirportPointForm({ point, flag }) {
  const [query, setQuery] = React.useState(point.airport)
  const [showSuggestions, setShowSuggestions] = React.useState(false)
  const suggestions = [
    { code: 'BER', name: 'Berlin Brandenburg Airport', country: '🇩🇪', tz: 'Europe/Berlin' },
    { code: 'MUC', name: 'Munich Airport', country: '🇩🇪', tz: 'Europe/Berlin' },
    { code: 'HND', name: 'Tokyo Haneda Airport', country: '🇯🇵', tz: 'Asia/Tokyo' },
    { code: 'NRT', name: 'Tokyo Narita Airport', country: '🇯🇵', tz: 'Asia/Tokyo' },
    { code: 'LHR', name: 'London Heathrow Airport', country: '🇬🇧', tz: 'Europe/London' },
    { code: 'CDG', name: 'Paris Charles de Gaulle', country: '🇫🇷', tz: 'Europe/Paris' },
  ]
  const filtered = query.length > 0
    ? suggestions.filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.code.toLowerCase().includes(query.toLowerCase()))
    : suggestions

  return (
    <div style={{padding:'10px 12px', display:'flex', flexDirection:'column', gap:8}}>
      {/* Airport combobox */}
      <div style={{position:'relative'}}>
        <div style={{display:'flex', gap:6}}>
          <div style={{flex:1, position:'relative'}}>
            <div style={{position:'absolute', left:8, top:'50%', transform:'translateY(-50%)', pointerEvents:'none'}}>
              <i data-lucide="search" style={{width:13,height:13,color:'var(--muted-fg)'}}></i>
            </div>
            <input value={query} onChange={e=>{setQuery(e.target.value); setShowSuggestions(true)}}
              onFocus={()=>setShowSuggestions(true)} onBlur={()=>setTimeout(()=>setShowSuggestions(false),150)}
              placeholder="Search airports..."
              style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',font:'500 0.75rem/1.4 Inter,sans-serif',color:'var(--fg)',padding:'0.375rem 0.625rem 0.375rem 28px',height:'2rem',width:'100%',boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif'}}
              onMouseDown={e=>setShowSuggestions(true)} />
          </div>
          <button style={{display:'flex',alignItems:'center',gap:5,padding:'0 10px',height:32,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',color:'var(--fg)',fontSize:'0.75rem',fontWeight:500,fontFamily:'Inter,sans-serif',cursor:'pointer',whiteSpace:'nowrap'}}>
            <i data-lucide="circle-plus" style={{width:13,height:13}}></i>
            Add New
          </button>
        </div>
        {showSuggestions && filtered.length > 0 && (
          <div style={{position:'absolute', top:'calc(100% + 4px)', left:0, right:0, background:'var(--popover)', border:'1px solid var(--border)', borderRadius:'var(--r-md)', zIndex:50, boxShadow:'0 4px 12px rgba(0,0,0,0.3)', overflow:'hidden'}}>
            {filtered.slice(0,5).map(s => (
              <div key={s.code}
                onMouseDown={()=>{ setQuery(s.name); setShowSuggestions(false) }}
                style={{display:'flex',alignItems:'center',gap:10,padding:'8px 12px',cursor:'pointer',borderBottom:'1px solid var(--border)',fontSize:'0.75rem'}}
                onMouseEnter={e=>e.currentTarget.style.background='var(--accent)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span style={{fontSize:'1rem'}}>{s.country}</span>
                <div>
                  <div style={{fontWeight:500, color:'var(--fg)'}}>{s.name}</div>
                  <div style={{fontSize:'0.65rem', color:'var(--muted-fg)'}}>{s.code} · {s.tz}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fields */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 80px 64px 64px', gap:8}}>
        <FlatField label="Date" value={point.date} onChange={()=>{}} type="date" />
        <FlatField label="Time" value={point.time} onChange={()=>{}} type="time" />
        <FlatField label="Terminal" value={point.terminal} onChange={()=>{}} placeholder="T1" />
        <FlatField label="Gate" value={point.gate} onChange={()=>{}} placeholder="B22" />
      </div>
    </div>
  )
}

function FullWidthBtn({ variant, children, onClick, style }) {
  const styles = {
    primary: {background:'var(--primary)', color:'white', border:'none'},
    secondary: {background:'transparent', color:'var(--fg)', border:'1px solid var(--border)'},
  }
  return (
    <button onClick={onClick}
      style={{width:'100%', height:40, borderRadius:'var(--r-md)', fontSize:'0.875rem', fontWeight:500, fontFamily:'Inter,sans-serif', cursor:'pointer', transition:'opacity 150ms', ...styles[variant], ...style}}
      onMouseEnter={e=>e.currentTarget.style.opacity='0.85'}
      onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
      {children}
    </button>
  )
}

function IconBtn({ icon, onClick }) {
  return (
    <button onClick={onClick}
      style={{width:32,height:32,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted-fg)'}}>
      <i data-lucide={icon} style={{width:15,height:15}}></i>
    </button>
  )
}

function RnButton({ variant='default', icon, children, onClick, style }) {
  const base = {display:'inline-flex', alignItems:'center', gap:5, padding:'0 10px', height:'1.75rem', borderRadius:'var(--r-md)', border:'none', fontSize:'0.75rem', fontWeight:500, fontFamily:'Inter,sans-serif', cursor:'pointer', transition:'all 120ms', flexShrink:0, ...style}
  const vars = {
    default: {background:'var(--primary)', color:'white'},
    secondary: {background:'var(--secondary)', color:'var(--secondary-fg)'},
    outline: {background:'transparent', color:'var(--fg)', border:'1px solid var(--border)'},
  }
  return (
    <button style={{...base, ...vars[variant]}} onClick={onClick}>
      {icon && <i data-lucide={icon} style={{width:13,height:13}}></i>}
      {children}
    </button>
  )
}

function RnSeparator({ style }) {
  return <div style={{height:1, background:'var(--border)', margin:'12px 0', ...style}}></div>
}

function FormField({ label, required, children, style }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:2, ...style}}>
      <label style={{fontSize:'0.7rem', fontWeight:500, color:'var(--fg)'}}>
        {label}{required && <span style={{color:'var(--destructive)', marginLeft:2}}>*</span>}
      </label>
      {children}
    </div>
  )
}

function RnInput({ type='text', value, onChange, placeholder, min, style }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} min={min}
      style={{background:'var(--card)',border:'1px solid var(--border)',borderRadius:'var(--r-md)',font:'500 0.75rem/1.4 Inter,sans-serif',color:'var(--fg)',padding:'0.375rem 0.625rem',height:'2rem',width:'100%',boxSizing:'border-box',outline:'none',fontFamily:'Inter,sans-serif', ...style}}
      onFocus={e=>{e.target.style.borderColor='var(--ring)'}}
      onBlur={e=>{e.target.style.borderColor='var(--border)'}} />
  )
}

Object.assign(window, { FlightForm, HotelForm, RnButton, RnInput, RnSeparator, FormField: FormField, FlatField, SectionCard, FullWidthBtn, IconBtn })
