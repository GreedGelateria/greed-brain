// GREED Brain - accesso con account GREED (fase C)
// Ogni pagina di Brain chiama richiediAccesso(app) prima di leggere il database.
// Entrano solo gli account GREED; il PIN delle pagine resta come secondo livello.
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';

const EMAIL_GREED = ['gelateriagreed@gmail.com', 'team.greedfrascati@gmail.com'];

export function richiediAccesso(app) {
  const auth = getAuth(app);
  let gate = null;
  const mostra = (msg) => {
    if (!gate) {
      gate = document.createElement('div');
      gate.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;background:#1f2e1a;font-family:system-ui,sans-serif';
      gate.innerHTML = '<div style="background:#fff;border-radius:18px;padding:32px 26px;max-width:400px;width:90%;text-align:center">'
        + '<div style="font-size:1.4rem;font-weight:800;color:#2d4a22">GREED Brain</div>'
        + '<div style="color:#5a6b52;margin:10px 0 20px;font-size:.95rem;line-height:1.5">Accedi con l\'account GREED<br>(staff o Dario).</div>'
        + '<button type="button" style="width:100%;padding:14px;border:none;border-radius:12px;background:#4a6b34;color:#fff;font-size:1rem;font-weight:700;cursor:pointer">Accedi con Google</button>'
        + '<div class="msg" style="color:#b23a2b;font-size:.85rem;margin-top:14px;min-height:1em"></div></div>';
      gate.querySelector('button').onclick = () => {
        gate.querySelector('.msg').textContent = '';
        signInWithPopup(auth, new GoogleAuthProvider()).catch(e => { gate.querySelector('.msg').textContent = 'Accesso non riuscito: ' + e.message; });
      };
      document.body.appendChild(gate);
    }
    gate.querySelector('.msg').textContent = msg || '';
    gate.style.display = 'flex';
  };
  return new Promise(ok => {
    onAuthStateChanged(auth, u => {
      if (u && EMAIL_GREED.includes(u.email)) {
        if (gate) gate.style.display = 'none';
        window.GREED_ACCOUNT = u.email;
        ok(u);
      } else {
        if (u) { signOut(auth); mostra('Account ' + u.email + ' non autorizzato.'); }
        else mostra('');
      }
    });
  });
}
