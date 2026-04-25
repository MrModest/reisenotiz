// Dialogs.jsx — Create trip dialog and confirm dialog

function CreateTripDialog({ open, onClose, onCreate }) {
  const [name, setName] = React.useState('')
  const [start, setStart] = React.useState('')
  const [end, setEnd] = React.useState('')

  if (!open) return null

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({ name, start, end })
    setName(''); setStart(''); setEnd('')
    onClose()
  }

  return (
    <div style={{position:'fixed', inset:0, zIndex:100, display:'flex', alignItems:'center', justifyContent:'center', padding:16}}>
      <div onClick={onClose} style={{position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(2px)'}}></div>
      <div style={{position:'relative', background:'var(--popover)', borderRadius:'var(--r-lg)', padding:'20px', width:'100%', maxWidth:380, boxShadow:'0 8px 24px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16}}>
          <div>
            <h2 style={{margin:0, fontSize:'0.9375rem', fontWeight:600, color:'var(--fg)'}}>New Trip</h2>
            <p style={{margin:'2px 0 0', fontSize:'0.7rem', color:'var(--muted-fg)'}}>Add a new trip to your timeline.</p>
          </div>
          <button onClick={onClose} style={{width:24,height:24,borderRadius:'var(--r-sm)',border:'none',background:'transparent',cursor:'pointer',color:'var(--muted-fg)',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <i data-lucide="x" style={{width:14,height:14}}></i>
          </button>
        </div>

        <div style={{display:'flex', flexDirection:'column', gap:10}}>
          <FormField label="Trip Name" required>
            <input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Tokyo Adventure"
              style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',font:'500 0.75rem/1.4 Inter,sans-serif',color:'var(--fg)',padding:'0.375rem 0.75rem',height:'2rem',width:'100%',boxSizing:'border-box',outline:'none'}}
              onFocus={e=>{e.target.style.borderColor='var(--primary)'; e.target.style.boxShadow='0 0 0 2px oklch(0.6397 0.172 36.44 / 0.2)'}}
              onBlur={e=>{e.target.style.borderColor='var(--border)'; e.target.style.boxShadow='none'}} />
          </FormField>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8}}>
            <FormField label="Start Date" required>
              <input type="date" value={start} onChange={e=>setStart(e.target.value)}
                style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',font:'500 0.75rem/1.4 Inter,sans-serif',color:'var(--fg)',padding:'0.375rem 0.5rem',height:'2rem',width:'100%',boxSizing:'border-box',outline:'none'}}
                onFocus={e=>{e.target.style.borderColor='var(--primary)'}}
                onBlur={e=>{e.target.style.borderColor='var(--border)'}} />
            </FormField>
            <FormField label="End Date" required>
              <input type="date" value={end} onChange={e=>setEnd(e.target.value)}
                style={{background:'var(--bg)',border:'1px solid var(--border)',borderRadius:'var(--r-sm)',font:'500 0.75rem/1.4 Inter,sans-serif',color:'var(--fg)',padding:'0.375rem 0.5rem',height:'2rem',width:'100%',boxSizing:'border-box',outline:'none'}}
                onFocus={e=>{e.target.style.borderColor='var(--primary)'}}
                onBlur={e=>{e.target.style.borderColor='var(--border)'}} />
            </FormField>
          </div>
        </div>

        <div style={{display:'flex', justifyContent:'flex-end', gap:8, marginTop:16}}>
          <button onClick={onClose}
            style={{padding:'0 12px',height:'1.75rem',borderRadius:'var(--r-md)',border:'1px solid var(--border)',background:'transparent',color:'var(--fg)',cursor:'pointer',fontSize:'0.75rem',fontWeight:500,fontFamily:'Inter,sans-serif'}}>
            Cancel
          </button>
          <button onClick={handleCreate}
            style={{padding:'0 12px',height:'1.75rem',borderRadius:'var(--r-md)',border:'none',background:'var(--primary)',color:'white',cursor:'pointer',fontSize:'0.75rem',fontWeight:500,fontFamily:'Inter,sans-serif'}}>
            Create Trip
          </button>
        </div>
      </div>
    </div>
  )
}

function FormField({ label, required, children }) {
  return (
    <div style={{display:'flex', flexDirection:'column', gap:2}}>
      <label style={{fontSize:'0.75rem', fontWeight:500, color:'var(--fg)'}}>
        {label} {required && <span style={{color:'var(--destructive)', fontSize:'0.7rem'}}>*</span>}
      </label>
      {children}
    </div>
  )
}

Object.assign(window, { CreateTripDialog, FormField })
