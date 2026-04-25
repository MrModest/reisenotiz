// TripItemView.jsx — Flight and Hotel detail views

function FlightView({ item, setScreen }) {
  const [activeTab, setActiveTab] = React.useState('departure')
  return (
    <div style={{paddingTop:4}}>
      {/* Item header with edit/delete */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <i data-lucide="plane" style={{width:15,height:15,color:'var(--primary)'}}></i>
          <span style={{fontWeight:600, fontSize:'0.8rem'}}>Flight Details</span>
        </div>
        <div style={{display:'flex', gap:5}}>
          <button onClick={()=>setScreen('flight-edit')} style={{width:26,height:26,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted-fg)'}}>
            <i data-lucide="square-pen" style={{width:12,height:12}}></i>
          </button>
          <button style={{width:26,height:26,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--destructive)'}}>
            <i data-lucide="trash-2" style={{width:12,height:12}}></i>
          </button>
        </div>
      </div>
      {/* Route summary */}
      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:8, background:'var(--card)', borderRadius:'var(--r-lg)', padding:'12px 14px', marginBottom:12, alignItems:'center'}}>
        <div>
          <div style={{fontWeight:700, fontSize:'1.2rem', color:'var(--primary)'}}>{item.departure.code}</div>
          <div style={{fontSize:'0.6875rem', color:'var(--muted-fg)', marginTop:2}}>{item.departure.city}</div>
          <div style={{fontSize:'1.1rem', fontWeight:600, marginTop:4}}>{item.departure.time}</div>
          <div style={{fontSize:'0.65rem', color:'var(--muted-fg)'}}>{item.departure.date}</div>
        </div>
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', gap:4}}>
          <div style={{fontSize:'0.65rem', color:'var(--muted-fg)'}}>{item.duration}</div>
          <div style={{display:'flex', alignItems:'center', gap:3, color:'var(--muted-fg)'}}>
            <div style={{width:20,height:1,background:'var(--border)'}}></div>
            <i data-lucide="plane" style={{width:14,height:14,color:'var(--primary)'}}></i>
            <div style={{width:20,height:1,background:'var(--border)'}}></div>
          </div>
          <div style={{fontSize:'0.6rem', color:'var(--muted-fg)', background:'var(--accent)', borderRadius:4, padding:'2px 5px'}}>{item.flightNo}</div>
        </div>
        <div style={{textAlign:'right'}}>
          <div style={{fontWeight:700, fontSize:'1.2rem', color:'var(--primary)'}}>{item.arrival.code}</div>
          <div style={{fontSize:'0.6875rem', color:'var(--muted-fg)', marginTop:2}}>{item.arrival.city}</div>
          <div style={{fontSize:'1.1rem', fontWeight:600, marginTop:4}}>{item.arrival.time}</div>
          <div style={{fontSize:'0.65rem', color:'var(--muted-fg)'}}>{item.arrival.date}</div>
        </div>
      </div>

      {/* Fields grid */}
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:12}}>
        {[['Airline',item.airline],['Flight',item.flightNo],['Booking',item.booking],['Seat',item.seat]].map(([l,v]) => (
          <FieldView key={l} label={l} value={v} />
        ))}
      </div>
      {item.passengers?.length > 0 && (
        <ChipsField label="Passengers" items={item.passengers} />
      )}

      {/* Separator */}
      <div style={{display:'flex',alignItems:'center',gap:8,margin:'12px 0'}}>
        <div style={{flex:1,height:1,background:'var(--border)'}}></div>
        <span style={{fontSize:'0.65rem',color:'var(--muted-fg)',fontWeight:500}}>Details</span>
        <div style={{flex:1,height:1,background:'var(--border)'}}></div>
      </div>

      {/* Tabs */}
      <div style={{marginBottom:8}}>
        <div style={{display:'flex', gap:0, borderBottom:'1px solid var(--border)'}}>
          {['departure','arrival'].map(tab => (
            <button key={tab} onClick={()=>setActiveTab(tab)}
              style={{flex:1, padding:'7px 0', border:'none', background:'transparent', cursor:'pointer', fontFamily:'Inter,sans-serif', fontSize:'0.75rem', fontWeight:500, color: activeTab===tab ? 'var(--primary)' : 'var(--muted-fg)', borderBottom: activeTab===tab ? '2px solid var(--primary)' : '2px solid transparent', transition:'all 100ms'}}>
              {tab === 'departure' ? '✈ Departure' : '✈ Arrival'}
            </button>
          ))}
        </div>
        <div style={{background:'var(--card)', borderRadius:'0 0 var(--r-lg) var(--r-lg)', padding:12}}>
          {activeTab === 'departure' ? (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <FieldView label="Airport" value={item.departure.airport} />
              <FieldView label="Terminal" value={item.departure.terminal} />
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <FieldView label="Airport" value={item.arrival.airport} />
              <FieldView label="Terminal" value={item.arrival.terminal} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function HotelView({ item, setScreen }) {
  return (
    <div style={{paddingTop:4}}>
      {/* Item header with edit/delete */}
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
        <div style={{display:'flex', alignItems:'center', gap:7}}>
          <i data-lucide="bed" style={{width:15,height:15,color:'var(--primary)'}}></i>
          <span style={{fontWeight:600, fontSize:'0.8rem'}}>Hotel Details</span>
        </div>
        <div style={{display:'flex', gap:5}}>
          <button onClick={()=>setScreen('hotel-edit')} style={{width:26,height:26,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--muted-fg)'}}>
            <i data-lucide="square-pen" style={{width:12,height:12}}></i>
          </button>
          <button style={{width:26,height:26,borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--destructive)'}}>
            <i data-lucide="trash-2" style={{width:12,height:12}}></i>
          </button>
        </div>
      </div>
      {/* Check-in/out */}
      <div style={{display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:8, background:'var(--card)', borderRadius:'var(--r-xs)', padding:'12px 14px', marginBottom:12, alignItems:'center'}}>
        <div>
          <div style={{fontSize:'0.65rem', color:'var(--muted-fg)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6}}>Check In</div>
          <div style={{fontSize:'1rem', fontWeight:600}}>{item.checkIn.day}</div>
          <div style={{fontSize:'1.1rem'}}>{item.checkIn.time}</div>
        </div>
        <div style={{width:1, height:48, background:'var(--border)'}}></div>
        <div style={{textAlign:'right'}}>
          <div style={{fontSize:'0.65rem', color:'var(--muted-fg)', fontWeight:500, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:6}}>Check Out</div>
          <div style={{fontSize:'1rem', fontWeight:600}}>{item.checkOut.day}</div>
          <div style={{fontSize:'1.1rem'}}>{item.checkOut.time}</div>
        </div>
      </div>

      {/* Fields */}
      <div style={{display:'flex', flexDirection:'column', gap:8, marginBottom:12}}>
        <FieldView label={`Name (${item.kind})`} value={item.name} />
        <FieldView label="Address" value={item.address} subValue={item.location} />
        {item.contact && <FieldView label="Contact" value={item.contact} />}
      </div>

      {/* Separator */}
      <div style={{display:'flex',alignItems:'center',gap:8,margin:'12px 0'}}>
        <div style={{flex:1,height:1,background:'var(--border)'}}></div>
        <span style={{fontSize:'0.65rem',color:'var(--muted-fg)',fontWeight:500}}>Details</span>
        <div style={{flex:1,height:1,background:'var(--border)'}}></div>
      </div>
      <div style={{display:'flex',gap:8}}>
        <FieldView label="Reserved On" value={item.reservedOn} style={{flex:1}} />
        <FieldView label="Guests" value={item.guests} />
        <FieldView label="Rooms" value={item.rooms} />
      </div>
    </div>
  )
}

function FieldView({ label, value, subValue, style }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:2, ...style}}>
      <span style={{fontSize:'0.6rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--muted-fg)'}}>{label}</span>
      <span style={{fontSize:'0.75rem', fontWeight:500, color:'var(--fg)'}}>{value || '—'}</span>
      {subValue && <span style={{fontSize:'0.65rem', color:'var(--muted-fg)'}}>{subValue}</span>}
    </div>
  )
}

function ChipsField({ label, items }) {
  return (
    <div style={{marginBottom:8}}>
      <div style={{fontSize:'0.6rem', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--muted-fg)', marginBottom:4}}>{label}</div>
      <div style={{display:'flex', gap:4, flexWrap:'wrap'}}>
        {items.map((p,i) => (
          <span key={i} style={{background:'var(--secondary)', color:'var(--secondary-fg)', borderRadius:9999, padding:'2px 8px', fontSize:'0.65rem', fontWeight:500}}>{p}</span>
        ))}
      </div>
    </div>
  )
}

Object.assign(window, { FlightView, HotelView, FieldView, ChipsField })
