import React from "react";

function LoginModal({ open, onClose, onLogin, username, setUsername, password, setPassword, loginError, theme }) {
  if (!open) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)'
    }}>
      <div style={{
        backgroundColor: theme?.surface || theme?.surfaceAlt || theme?.panel || '#241c3a',
        borderRadius: 12,
        padding: 24,
        maxWidth: 400,
        width: '90%',
        boxShadow: theme?.shadow || '0 4px 24px #0004'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: theme?.text || '#23202d', fontSize: 20, fontWeight: 700 }}>Connexion</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <input 
            type="text" 
            value={username} 
            onChange={e => setUsername(e.target.value)} 
            placeholder="Nom d'utilisateur" 
            style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${theme?.border || '#ccc'}`, backgroundColor: theme?.input || '#f9f9f9', color: theme?.text || '#23202d', fontSize: 16 }}
          />
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Mot de passe" 
            style={{ width: "100%", padding: 10, borderRadius: 8, border: `1px solid ${theme?.border || '#ccc'}`, backgroundColor: theme?.input || '#f9f9f9', color: theme?.text || '#23202d', fontSize: 16 }}
          />
          {loginError && <div style={{ color: "#ef4444", fontSize: 12 }}>{loginError}</div>}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
            <button 
              onClick={onClose} 
              style={{ padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 600, backgroundColor: "#6b7280", color: "white", border: "none", cursor: "pointer" }}
            >Annuler</button>
            <button 
              onClick={onLogin} 
              style={{ padding: '10px 16px', borderRadius: 8, fontSize: 14, fontWeight: 700, backgroundColor: "#10b981", color: "white", border: "none", cursor: "pointer" }}
            >Valider</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
