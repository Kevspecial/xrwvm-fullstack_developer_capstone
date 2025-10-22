import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import styles from './Luxury.module.css';

// ---------- Auth Context ----------
const AuthContext = createContext(null);
const useAuth = () => useContext(AuthContext);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const u = sessionStorage.getItem('username');
    return u ? { username: u } : null;
  });

  const login = async ({ userName, password }) => {
    const res = await fetch('/djangoapp/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password })
    });
    const json = await res.json();
    if (json?.status === 'Authenticated') {
      sessionStorage.setItem('username', json.userName);
      setUser({ username: json.userName });
      return { ok: true };
    }
    return { ok: false, error: 'Invalid credentials' };
  };

  const logout = async () => {
    await fetch('/djangoapp/logout');
    sessionStorage.removeItem('username');
    setUser(null);
  };

  const register = async ({ userName, password, firstName, lastName, email }) => {
    const res = await fetch('/djangoapp/registration', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userName, password, firstName, lastName, email })
    });
    const json = await res.json();
    if (json?.status === 'Authenticated') {
      sessionStorage.setItem('username', json.userName);
      setUser({ username: json.userName });
      return { ok: true };
    }
    return { ok: false, error: json?.error || 'Registration failed' };
  };

  const value = useMemo(() => ({ user, login, logout, register }), [user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ---------- Hooks ----------
function useApi(url, opts={}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const refetch = async () => {
    try {
      setLoading(true);
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setData(json);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { refetch(); /* eslint-disable-next-line */ }, [url]);
  return { data, loading, error, refetch };
}

// ---------- UI atoms ----------
const Button = ({ variant='primary', className='', ...props }) => {
  const cls = variant === 'ghost' ? styles.btnGhost : styles.cta;
  return <button className={`${cls} ${className}`} {...props} />
};
const Badge = ({ className='', children }) => <span className={`${styles.badge} ${className}`}>{children}</span>;

// ---------- Header ----------
function Header({ onLogin, onRegister }) {
  const { user, logout } = useAuth();
  return (
    <header className={styles.header}>
      <div className={`${styles.nav} ${styles.container}`}>
        <a href="/new" className={styles.brand}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 12h16M12 4v16" stroke="url(#g)" strokeWidth="2" strokeLinecap="round"/><defs><linearGradient id="g" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse"><stop stopColor="#00D4FF"/><stop offset="1" stopColor="#3EA0FF"/></linearGradient></defs></svg>
          <span>XRWVM Motors</span>
          <Badge>Capstone</Badge>
        </a>
        <nav className={styles.navLinks}>
          <a href="/new" className={`${styles.navLink} active`}>Discover</a>
          <a href="/dealers" className={styles.navLink}>Legacy</a>
          {user ? (
            <>
              <span className={styles.navLink}>Hi, {user.username}</span>
              <Button onClick={logout}>Logout</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onLogin}>Sign in</Button>
              <Button onClick={onRegister}>Create account</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

// ---------- Hero ----------
function Hero({ onPrimaryClick }) {
  return (
    <section className={`${styles.hero} ${styles.container}`}>
      <div className={styles.heroImg} style={{backgroundImage:'url(/static/car_dealership.jpg)'}}/>
      <div className={styles.heroGradient}/>
      <div className={styles.heroInner}>
        <div className={styles.kicker}>Luxury & Performance</div>
        <h1 className={styles.title}>Find your next dealership. Share real experiences.</h1>
        <p className={styles.subtitle}>Browse trusted dealers, read authentic reviews, and post your own with sentiment insights. Designed with precision for the modern driver.</p>
        <div className={styles.heroActions}>
          <Button onClick={onPrimaryClick}>Explore dealers</Button>
          <Button variant="ghost" as="a" aria-label="Learn more">Learn more</Button>
        </div>
      </div>
    </section>
  );
}

// ---------- Dealers grid ----------
function DealersSection({ onSelectDealer }) {
  const { data, loading, error, refetch } = useApi('/djangoapp/get_dealers');
  const dealers = data?.dealers || [];
  const [states, setStates] = useState([]);
  const [state, setState] = useState('All');
  const [useNearby, setUseNearby] = useState(false);
  const [coords, setCoords] = useState(null);

  useEffect(() => {
    if (dealers.length) {
      setStates(Array.from(new Set(dealers.map(d => d.state))));
    }
  }, [dealers]);

  useEffect(() => {
    async function filter() {
      const url = state === 'All' ? '/djangoapp/get_dealers' : `/djangoapp/get_dealers/${state}`;
      await fetch(url).then(r => r.json()).then(j => {
        data.dealers = j.dealers; // mutate local reference for simplicity
      }).catch(()=>{});
    }
    // eslint-disable-next-line
    if (data) filter();
  }, [state]);

  useEffect(() => {
    if (useNearby) {
      navigator.geolocation?.getCurrentPosition((pos) => {
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
      }, () => setUseNearby(false));
    }
  }, [useNearby]);

  const nearby = (d) => {
    if (!coords) return true;
    const toRad = (x)=> x*Math.PI/180;
    const R = 6371; // km
    const lat1 = coords.lat, lon1 = coords.lon;
    const lat2 = parseFloat(d.lat), lon2 = parseFloat(d.long);
    if (Number.isNaN(lat2) || Number.isNaN(lon2)) return true;
    const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const dist = R * c; // km
    return dist < 200; // 200km radius
  };

  return (
    <section className={`${styles.section} ${styles.container}`} id="dealers">
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.h2}>Discover dealers</h2>
          <div className={styles.helper}>Filter by state or near you</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <select className={styles.select} value={state} onChange={(e)=>setState(e.target.value)} aria-label="State">
            <option value="All">All States</option>
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="ghost" onClick={()=> setUseNearby(v=>!v)}>{useNearby ? 'Using location' : 'Use my location'}</Button>
          <Button onClick={()=>refetch()}>Refresh</Button>
        </div>
      </div>

      {loading && (
        <div className={styles.grid}>
          {Array.from({length: 6}).map((_,i)=> <div key={i} className={`${styles.skel} ${styles.card}`}/>) }
        </div>
      )}
      {error && <div role="alert">Error loading dealers.</div>}
      {!loading && (
        <div className={styles.grid}>
          {dealers.filter(nearby).map(d => (
            <article key={d.id} className={styles.card}>
              <div className={styles.cardImg} style={{backgroundImage:`url(https://source.unsplash.com/collection/9050118/800x450?sig=${d.id})`}} aria-hidden="true"/>
              <div className={styles.cardBody}>
                <div className={styles.cardRow}>
                  <div>
                    <div className={styles.cardTitle}>{d.full_name}</div>
                    <div className={styles.cardMeta}>{d.city}, {d.state}</div>
                  </div>
                  <span className={styles.badgeState}>{d.zip}</span>
                </div>
                <div className={styles.cardRow}>
                  <small className={styles.helper}>{d.address}</small>
                  <Button variant="ghost" onClick={()=> onSelectDealer(d)}>View</Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------- Dealer detail modal ----------
function DealerDetailModal({ dealer, onClose }) {
  const { data, loading } = useApi(`/djangoapp/reviews/dealer/${dealer?.id}`);
  const reviews = data?.reviews || [];
  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.sheet}>
        <div className={styles.sheetHead}>
          <div>
            <strong>{dealer.full_name}</strong>
            <div className={styles.helper}>{dealer.city}, {dealer.state} · {dealer.address}</div>
          </div>
          <button className={styles.close} onClick={onClose} aria-label="Close">×</button>
        </div>
        <div className={styles.sheetBody}>
          <div>
            <h3 className={styles.h2} style={{marginBottom:8}}>Reviews</h3>
            {loading ? (
              <div className={styles.reviewList}>
                {Array.from({length:4}).map((_,i)=> <div key={i} className={`${styles.skel} ${styles.review}`}/>) }
              </div>
            ) : (
              <div className={styles.reviewList}>
                {reviews.length === 0 && <div className={styles.helper}>No reviews yet.</div>}
                {reviews.map((r, idx) => (
                  <div className={styles.review} key={idx}>
                    <div style={{display:'flex', alignItems:'center', justifyContent:'space-between'}}>
                      <div><strong>{r.name}</strong> <span className={styles.helper}>· {r.car_make} {r.car_model} {r.car_year}</span></div>
                      <span className={`${styles.senti} ${r.sentiment === 'positive' ? 'pos' : r.sentiment === 'negative' ? 'neg' : 'neu'}`}>{r.sentiment}</span>
                    </div>
                    <div style={{marginTop:6}}>{r.review}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <ReviewForm dealer={dealer} onPosted={onClose} />
        </div>
      </div>
    </div>
  );
}

// ---------- Review form with (placeholder) live sentiment ----------
function ReviewForm({ dealer, onPosted }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [date, setDate] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [cars, setCars] = useState([]);
  const [preview, setPreview] = useState(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetch('/djangoapp/get_cars').then(r=>r.json()).then(j=> setCars(j.CarModels || [])).catch(()=>{});
  }, []);

  const makes = useMemo(() => Array.from(new Set(cars.map(c => c.CarMake))), [cars]);
  const models = useMemo(() => cars.filter(c => c.CarMake === make).map(c => c.CarModel), [cars, make]);

  useEffect(() => {
    // Lightweight client-side preview as a fallback
    if (!text) { setPreview(null); return; }
    const positiveWords = ['great','excellent','love','amazing','fantastic','smooth','fast','reliable'];
    const negativeWords = ['bad','terrible','hate','awful','slow','unreliable','worst'];
    const t = text.toLowerCase();
    let score = 0;
    positiveWords.forEach(w => { if (t.includes(w)) score++; });
    negativeWords.forEach(w => { if (t.includes(w)) score--; });
    setPreview(score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral');
  }, [text]);

  const submit = async () => {
    if (!user) return alert('Please sign in to post a review.');
    if (!text || !date || !make || !model || !year) return alert('All fields are required.');
    const payload = {
      name: user.username,
      dealership: dealer.id,
      review: text,
      purchase: true,
      purchase_date: date,
      car_make: make,
      car_model: model,
      car_year: year,
    };
    try {
      setPosting(true);
      const res = await fetch('/djangoapp/add_review', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const json = await res.json();
      if (json.status === 200) onPosted?.();
      else alert('Failed to post review');
    } finally { setPosting(false); }
  };

  return (
    <div>
      <h3 className={styles.h2} style={{marginBottom:8}}>Add a review</h3>
      <div className={styles.form}>
        <div className={styles.field}>
          <textarea className={styles.input} rows={5} placeholder=" " value={text} onChange={(e)=>setText(e.target.value)} aria-label="Your review"/>
          <label className={styles.label}>Your review</label>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <div className={styles.field}>
            <input type="date" className={styles.input} placeholder=" " value={date} onChange={(e)=>setDate(e.target.value)} aria-label="Purchase date"/>
            <label className={styles.label}>Purchase date</label>
          </div>
          <div className={styles.field}>
            <input type="number" className={styles.input} placeholder=" " min={2015} max={new Date().getFullYear()} value={year} onChange={(e)=>setYear(e.target.value)} aria-label="Car year"/>
            <label className={styles.label}>Car year</label>
          </div>
        </div>
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
          <div className={styles.field}>
            <select className={styles.select} value={make} onChange={(e)=> { setMake(e.target.value); setModel(''); }} aria-label="Car make">
              <option value="">Choose make</option>
              {makes.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div className={styles.field}>
            <select className={styles.select} value={model} onChange={(e)=>setModel(e.target.value)} aria-label="Car model" disabled={!make}>
              <option value="">{make ? 'Choose model' : 'Select make first'}</option>
              {models.map((m, idx) => <option key={`${make}-${m}-${idx}`} value={m}>{m}</option>)}
            </select>
          </div>
        </div>
        <div className={styles.actions}>
          {preview && <span className={`${styles.senti} ${preview === 'positive' ? 'pos' : preview === 'negative' ? 'neg' : 'neu'}`}>Preview: {preview}</span>}
          <Button disabled={posting} onClick={submit}>{posting ? 'Posting…' : 'Post review'}</Button>
        </div>
      </div>
    </div>
  );
}

// ---------- Vehicles ----------
function VehiclesSection() {
  const { data, loading } = useApi('/djangoapp/get_cars');
  const cars = data?.CarModels || [];
  return (
    <section className={`${styles.section} ${styles.container}`}>
      <div className={styles.sectionHeader}>
        <div>
          <h2 className={styles.h2}>Popular vehicles</h2>
          <div className={styles.helper}>Select from makes & models</div>
        </div>
      </div>
      {loading ? (
        <div className={styles.grid}>
          {Array.from({length: 6}).map((_,i)=> <div key={i} className={`${styles.skel} ${styles.card}`}/>) }
        </div>
      ) : (
        <div className={styles.grid}>
          {cars.slice(0,9).map((c, i) => (
            <article key={`${c.CarMake}-${c.CarModel}-${i}`} className={styles.card}>
              <div className={styles.cardImg} style={{backgroundImage:`url(https://source.unsplash.com/1600x900/?${encodeURIComponent(c.CarMake + ' ' + c.CarModel)},car)`}}/>
              <div className={styles.cardBody}>
                <div className={styles.cardTitle}>{c.CarMake} {c.CarModel}</div>
                <div className={styles.cardMeta}>{c.type} · {c.year}</div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------- Auth Modals ----------
function LoginModal({ onClose }) {
  const { login } = useAuth();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);
  const submit = async (e)=>{
    e.preventDefault();
    const { ok, error } = await login({ userName, password });
    if (!ok) setErr(error); else onClose();
  };
  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.sheet} style={{maxWidth:520}}>
        <div className={styles.sheetHead}>
          <strong>Sign in</strong>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>
        <div style={{padding:18}}>
          <form onSubmit={submit} className={styles.form}>
            <div className={styles.field}><input className={styles.input} placeholder=" " value={userName} onChange={(e)=>setUserName(e.target.value)} /><label className={styles.label}>Username</label></div>
            <div className={styles.field}><input type="password" className={styles.input} placeholder=" " value={password} onChange={(e)=>setPassword(e.target.value)} /><label className={styles.label}>Password</label></div>
            {err && <div role="alert" className={styles.helper} style={{color:'#f88'}}>{err}</div>}
            <div className={styles.actions}><Button type="submit">Login</Button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

function RegisterModal({ onClose }) {
  const { register } = useAuth();
  const [form, setForm] = useState({ userName:'', email:'', firstName:'', lastName:'', password:'' });
  const [err, setErr] = useState(null);
  const submit = async (e)=>{
    e.preventDefault();
    const { ok, error } = await register(form);
    if (!ok) setErr(error); else onClose();
  };
  return (
    <div className={styles.modal} role="dialog" aria-modal="true">
      <div className={styles.sheet} style={{maxWidth:640}}>
        <div className={styles.sheetHead}>
          <strong>Create account</strong>
          <button className={styles.close} onClick={onClose}>×</button>
        </div>
        <div style={{padding:18}}>
          <form onSubmit={submit} className={styles.form}>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10}}>
              <div className={styles.field}><input className={styles.input} placeholder=" " value={form.userName} onChange={(e)=>setForm({...form, userName: e.target.value})} /><label className={styles.label}>Username</label></div>
              <div className={styles.field}><input className={styles.input} placeholder=" " value={form.email} onChange={(e)=>setForm({...form, email: e.target.value})} /><label className={styles.label}>Email</label></div>
              <div className={styles.field}><input className={styles.input} placeholder=" " value={form.firstName} onChange={(e)=>setForm({...form, firstName: e.target.value})} /><label className={styles.label}>First name</label></div>
              <div className={styles.field}><input className={styles.input} placeholder=" " value={form.lastName} onChange={(e)=>setForm({...form, lastName: e.target.value})} /><label className={styles.label}>Last name</label></div>
            </div>
            <div className={styles.field}><input type="password" className={styles.input} placeholder=" " value={form.password} onChange={(e)=>setForm({...form, password: e.target.value})} /><label className={styles.label}>Password</label></div>
            {err && <div role="alert" className={styles.helper} style={{color:'#f88'}}>{err}</div>}
            <div className={styles.actions}><Button type="submit">Create account</Button></div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------- Main page ----------
export default function LuxuryApp(){
  const [showLogin, setShowLogin] = useState(false);
  const [showReg, setShowReg] = useState(false);
  const [selected, setSelected] = useState(null);

  return (
    <AuthProvider>
      <main className={styles.page}>
        <Header onLogin={()=>setShowLogin(true)} onRegister={()=>setShowReg(true)} />
        <Hero onPrimaryClick={() => document.getElementById('dealers')?.scrollIntoView({behavior:'smooth'})} />
        <DealersSection onSelectDealer={(d)=> setSelected(d)} />
        <VehiclesSection />
        {selected && <DealerDetailModal dealer={selected} onClose={()=> setSelected(null)} />}
        {showLogin && <LoginModal onClose={()=> setShowLogin(false)} />}
        {showReg && <RegisterModal onClose={()=> setShowReg(false)} />}
      </main>
    </AuthProvider>
  );
}
