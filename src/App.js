import React from 'react';


import './App.css';
import { MdPlumbing, MdFireExtinguisher, MdConstruction, MdFormatPaint, MdLock, MdLockOpen } from 'react-icons/md';
import { FaHardHat, FaRulerCombined, FaFire, FaBrush, FaWindowRestore, FaWater, FaBolt, FaTools } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { CubeButton, LoginModal } from './ui';
import Plombier from './pages/Plombier';
import Chauffagiste from './pages/Chauffagiste';
import Macon from './pages/Macon';
import Couvreur from './pages/Couvreur';
import Menuisier from './pages/Menuisier';
import Electricien from './pages/Electricien';
import Peintre from './pages/Peintre';
import Carreleur from './pages/Carreleur';
import Platrier from './pages/Platrier';
import Etancheur from './pages/Etancheur';
import Charpentier from './pages/Charpentier';
import Dessinateur from './pages/Dessinateur';
import Serrurier from './pages/Serrurier';
import Ferrailleur from './pages/Ferrailleur';
import Calorifugeur from './pages/Calorifugeur';

const THEME = {
  background: '#23202d',
  accent1: '#f59e42',
  accent2: '#6d4aff',
  text: '#fff',
};


const modules = [
  {
    name: 'Plombier',
    icon: <MdPlumbing size={32} color="#0077b6" />, 
    link: '#plombier',
    color: '#caf0f8',
  },
  {
    name: 'Chauffagiste',
    icon: <MdFireExtinguisher size={32} color="#e85d04" />, 
    link: '#chauffagiste',
    color: '#ffd6a5',
  },
  {
    name: 'Maçon',
    icon: <FaTools size={32} color="#e63946" />, 
    link: '#macon',
    color: '#f87171',
  },
  {
    name: 'Couvreur',
    icon: <FaTools size={32} color="#795548" />, 
    link: '#couvreur',
    color: '#bcaaa4',
  },
  {
    name: 'Menuisier',
    icon: <FaRulerCombined size={32} color="#fbbf24" />, 
    link: '#menuisier',
    color: '#fde68a',
  },
  {
    name: 'Électricien',
    icon: <FaBolt size={32} color="#7c3aed" />, 
    link: '#electricien',
    color: '#a5b4fc',
  },
  {
    name: 'Peintre',
    icon: <MdFormatPaint size={32} color="#22c55e" />, 
    link: '#peintre',
    color: '#bbf7d0',
  },
  {
    name: 'Carreleur',
    icon: <FaWindowRestore size={32} color="#38bdf8" />, 
    link: '#carreleur',
    color: '#bae6fd',
  },
  {
    name: 'Plâtrier',
    icon: <FaHardHat size={32} color="#facc15" />, 
    link: '#platrier',
    color: '#fef08a',
  },
  {
    name: 'Étancheur',
    icon: <FaWater size={32} color="#0ea5e9" />, 
    link: '#etancheur',
    color: '#bae6fd',
  },
  {
    name: 'Charpentier',
    icon: <MdConstruction size={32} color="#f97316" />, 
    link: '#charpentier',
    color: '#fdba74',
  },
  {
    name: 'Dessinateur',
    icon: <FaRulerCombined size={32} color="#a21caf" />, 
    link: '#dessinateur',
    color: '#e9d5ff',
  },
  {
    name: 'Serrurier',
    icon: <FaTools size={32} color="#64748b" />, 
    link: '#serrurier',
    color: '#cbd5e1',
  },
  {
    name: 'Ferrailleur',
    icon: <FaTools size={32} color="#6d4aff" />, 
    link: '#ferrailleur',
    color: '#c7d2fe',
  },
  {
    name: 'Calorifugeur',
    icon: <FaFire size={32} color="#fb7185" />, 
    link: '#calorifugeur',
    color: '#fecdd3',
  }
];


function App() {
  const [selected, setSelected] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  // global unsaved flag updated by ModulePage via onDirtyChange
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showConfirmPushModal, setShowConfirmPushModal] = useState(false);
  const [pushStatus, setPushStatus] = useState('idle'); // 'idle'|'pending'|'done'|'error'
  const [pushMessage, setPushMessage] = useState('');

  const MODULES_CONFIG_KEY = 'modules_config_v1';
  const [modulesConfig, setModulesConfig] = useState(() => {
    try {
      const raw = localStorage.getItem(MODULES_CONFIG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const normalized = {};
        modules.forEach(m => {
          const p = parsed && parsed[m.name];
          normalized[m.name] = {
            requiresAuth: (p && typeof p.requiresAuth === 'boolean') ? p.requiresAuth : !(m.name === 'Plombier' || m.name === 'Chauffagiste')
          };
        });
        return normalized;
      }
    } catch (e) {
      // ignore
    }
    const defaults = {};
    modules.forEach(m => {
      defaults[m.name] = {
        requiresAuth: !(m.name === 'Plombier' || m.name === 'Chauffagiste')
      };
    });
    return defaults;
  });

  const saveModulesConfig = (updater) => {
    setModulesConfig(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try { localStorage.setItem(MODULES_CONFIG_KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    });
  };

  const toggleRequiresAuth = (name) => {
    saveModulesConfig(prev => ({ ...prev, [name]: { ...(prev[name] || {}), requiresAuth: !(prev[name]?.requiresAuth ?? false) } }));
  };

  const handleClick = (module) => {
    setSelected(module.name);
  };

  const handleLogin = () => {
    // Use process.env for credentials
    const envUser = process.env.REACT_APP_USERNAME || "Apostrophe";
    const envPass = process.env.REACT_APP_PASSWORD || "Admin";
    if (username === envUser && password === envPass) {
      setLoginError("");
      setLoginOpen(false);
      setUsername("");
      setPassword("");
      setIsAdmin(true);
    } else {
      setLoginError("Nom d'utilisateur ou mot de passe incorrect");
    }
  };

  // Affichage de la page du module sélectionné
  if (selected) {
    const goHome = () => setSelected(null);
    const attemptGoHome = () => {
      if (isAdmin && hasUnsavedChanges) {
        setShowConfirmPushModal(true);
        return;
      }
      goHome();
    };

    const pushAndGoHome = async () => {
      setPushStatus('pending');
      setPushMessage('');
      try {
        // Prepare module storage key to read current edits from localStorage and send them to server
        const computeStorageKey = (moduleName) => {
          try {
            const moduleKey = (moduleName || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
            const rawKey = `module_${moduleKey}`;
            return `${rawKey}_v1`;
          } catch (e) { return null; }
        };

        let bodyPayload = null;
        try {
          const storageKey = computeStorageKey(selected);
          const raw = storageKey ? (localStorage.getItem(storageKey) || localStorage.getItem(`module_${selected}`)) : null;
          if (raw) {
            try { bodyPayload = JSON.parse(raw); } catch (e) { bodyPayload = raw; }
          }
        } catch (e) { bodyPayload = null; }

        // Call server endpoint with current module data (if available)
        const res = await fetch('/api/export-push', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ data: bodyPayload }) });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error('Export failed: ' + txt);
        }
        // trigger publish (optional)
        try {
          const res2 = await fetch('/api/publish', { method: 'POST' });
          if (!res2.ok) {
            const txt2 = await res2.text();
            // not fatal — still consider export success
            setPushMessage('Export ok, publish failed: ' + txt2);
            setPushStatus('done');
            setHasUnsavedChanges(false);
            setShowConfirmPushModal(false);
            goHome();
            return;
          }
        } catch (e) {
          // ignore publish errors
        }

        setPushStatus('done');
        setHasUnsavedChanges(false);
        setShowConfirmPushModal(false);
        goHome();
      } catch (e) {
        setPushStatus('error');
        setPushMessage(e.message || String(e));
      }
    };

    const discardAndGoHome = () => {
      // user chooses to ignore changes and go home
      setHasUnsavedChanges(false);
      setShowConfirmPushModal(false);
      goHome();
    };

    const pages = {
      'Plombier': <Plombier isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Chauffagiste': <Chauffagiste isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Maçon': <Macon isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Couvreur': <Couvreur isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Menuisier': <Menuisier isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Électricien': <Electricien isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Peintre': <Peintre isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Carreleur': <Carreleur isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Plâtrier': <Platrier isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Étancheur': <Etancheur isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Charpentier': <Charpentier isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Dessinateur': <Dessinateur isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Serrurier': <Serrurier isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Ferrailleur': <Ferrailleur isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
      'Calorifugeur': <Calorifugeur isAdmin={isAdmin} onHome={attemptGoHome} onDirtyChange={setHasUnsavedChanges} />,
    };
    return (
      <>
        {pages[selected] || null}
        {showConfirmPushModal && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)' }}>
            <div style={{ width: 520, maxWidth: '94%', background: '#241c3a', padding: 20, borderRadius: 12, boxShadow: '0 8px 30px rgba(0,0,0,0.6)' }}>
              <h3 style={{ marginTop: 0, color: THEME.accent1 }}>Modifications non sauvegardées</h3>
              <p>Des modifications locales ont été détectées. Voulez‑vous pousser ces modifications vers GitHub (et déclencher la publication) avant de retourner à l'accueil ?</p>
              <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowConfirmPushModal(false)} style={{ padding: '8px 12px', borderRadius: 8, background: 'transparent', color: 'white', border: '1px solid #666' }}>Annuler</button>
                <button onClick={discardAndGoHome} style={{ padding: '8px 12px', borderRadius: 8, background: '#777', color: 'white', border: 'none' }}>Ignorer et revenir</button>
                <button onClick={pushAndGoHome} style={{ padding: '8px 12px', borderRadius: 8, background: THEME.accent1, color: '#111', border: 'none' }}>{pushStatus === 'pending' ? 'Envoi...' : 'Pousser et revenir'}</button>
              </div>
              {pushStatus === 'error' && <div style={{ marginTop: 10, color: '#f87171' }}>{pushMessage}</div>}
            </div>
          </div>
        )}
      </>
    );
  }

  // Menu principal
  return (
    <div
      className="App"
      style={{
        minHeight: '100vh',
        minWidth: '100vw',
        background: 'linear-gradient(120deg, #271d44 0%, #3a2a5c 60%, #241c3a 100%)',
      }}
    >
      <div
        className="main-header"
        style={{
          width: '100%',
          background: 'linear-gradient(120deg, #271d44 0%, #3a2a5c 60%, #241c3a 100%)',
          color: THEME.text,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5em',
          height: '70px',
          boxSizing: 'border-box',
          boxShadow: '0 4px 24px 0 #3a2a5c88, 0 2px 8px #fff4',
          fontWeight: 800,
          fontSize: '2em',
          letterSpacing: '0.5px',
        }}
      >
        <h1 style={{ margin: 0, fontWeight: 900, fontSize: '1.1em', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 8, background: `linear-gradient(135deg, ${THEME.accent1} 0%, ${THEME.accent2} 100%)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          <span style={{ marginRight: 6 }}>🛠️</span>
          Le Manuel
        </h1>
        <CubeButton
          width={120}
          height={45}
          depth={20}
          borderRadius={8}
          rotationAxis="X"
          rotationDuration={600}
          rotationDirection={1}
          faces={{
            front: { content: isAdmin ? 'Admin' : 'Connexion', background: THEME.accent2, textColor: THEME.text },
            back: { content: 'Retour', background: '#f97316', textColor: '#23202d' },
            left: { content: '', background: THEME.accent2 },
            right: { content: '', background: THEME.accent2 },
            top: { content: '', background: '#6d4aff' },
            bottom: { content: '', background: '#ff6b6b' },
          }}
          onClick={() => { if (!isAdmin) setLoginOpen(true); }}
        />
        <LoginModal
          open={loginOpen}
          onClose={() => { setLoginOpen(false); setLoginError(""); setUsername(""); setPassword(""); }}
          onLogin={handleLogin}
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          loginError={loginError}
          theme={{
            panel: '#241c3a',
            shadow: '0 4px 24px #0004',
            text: '#23202d',
            border: '#ccc',
            input: '#f9f9f9'
          }}
        />
      </div>
      <header className="App-header">
        <div className="circle-menu">
          {modules.map((mod, idx) => {
            const cfg = modulesConfig[mod.name] || { requiresAuth: !(mod.name === 'Plombier' || mod.name === 'Chauffagiste') };
            const disabled = (cfg.requiresAuth && !isAdmin);
            return (
              <div
                key={mod.name}
                className={`circle-item${disabled ? ' disabled' : ''}`}
                style={{
                  // Rayon plus petit pour rapprocher du centre (position-only)
                  transform: `rotate(${(360 / modules.length) * idx}deg) translate(0, -10.6em) rotate(-${(360 / modules.length) * idx}deg)`,
                }}
                onClick={disabled ? undefined : () => handleClick(mod)}
                title={disabled ? `${mod.name} — réservé` : mod.name}
                aria-disabled={disabled ? 'true' : 'false'}
              >
                <div className="circle-item-inner" style={{ background: mod.color }}>
                  {mod.icon}
                  <span className="circle-label">{mod.name}</span>
                  {isAdmin && (
                    <div className="circle-admin-controls" onClick={(e) => e.stopPropagation()}>
                      <button className="admin-btn" title={cfg.requiresAuth ? 'Requiert admin' : 'Public'} onClick={() => toggleRequiresAuth(mod.name)}>
                        {cfg.requiresAuth ? <MdLock /> : <MdLockOpen />}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
