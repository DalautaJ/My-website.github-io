/* Front-end for login / sign up / forgot / reset. All real checks happen on the SERVER. */
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function post(url, data) {
  try {
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'same-origin', body: JSON.stringify(data) });
    let body = {}; try { body = await r.json(); } catch (e) {}
    return { ok: r.ok, status: r.status, body };
  } catch (e) {
    return { ok: false, status: 0, body: { error: 'Cannot reach the server. Is it running? (npm start)' } };
  }
}

/* Password strength meter */
const pw = $('pw');
if (pw && document.querySelector('.meter i')) {
  const m = document.querySelector('.meter i'), mt = $('mtxt');
  pw.addEventListener('input', () => {
    const v = pw.value; let s = 0;
    if (v.length >= 8) s++; if (v.length >= 12) s++; if (/[A-Z]/.test(v) && /[a-z]/.test(v)) s++; if (/\d/.test(v)) s++; if (/[^A-Za-z0-9]/.test(v)) s++;
    const lv = [['0%', '#ff3b5c', ''], ['20%', '#ff3b5c', 'Very weak'], ['40%', '#ff8a3b', 'Weak'], ['60%', '#ffd23b', 'Okay'], ['80%', '#9bff3b', 'Strong'], ['100%', '#00ff9c', 'Excellent']][v ? Math.max(s, 1) : 0];
    m.style.width = lv[0]; m.style.background = lv[1]; mt.textContent = lv[2];
  });
}

/* Loading animation: plays while the request is running, then returns the server's answer */
async function runLoader(form, steps, req) {
  form.style.display = 'none'; $('loader').style.display = 'block';
  const st = $('status'), bar = $('lfill'), log = $('log'); log.innerHTML = '';
  const anim = (async () => {
    for (let i = 0; i < steps.length; i++) {
      st.textContent = steps[i]; bar.style.width = ((i + 1) / steps.length * 100) + '%';
      if (i > 0) { const l = document.createElement('li'); l.textContent = steps[i - 1].replace('…', ''); log.appendChild(l); }
      await sleep(700);
    }
  })();
  const [, res] = await Promise.all([anim, req]);
  return res;
}
function fail(form, msg) {
  $('loader').style.display = 'none'; form.style.display = 'block';
  $('lfill').style.width = '0'; $('err').textContent = msg;
}
function success(text) {
  const ring = document.querySelector('.ring');
  if (ring) ring.outerHTML = '<div class="ok">✅</div>';
  $('status').textContent = text;
}

/* Banner after sign up / reset */
const okmsg = $('okmsg');
if (okmsg) {
  const p = new URLSearchParams(location.search);
  if (p.get('registered')) okmsg.textContent = '✅ Account created! You can log in now.';
  if (p.get('reset')) okmsg.textContent = '✅ Password changed! Log in with your new password.';
}

/* LOGIN */
const lf = $('loginForm');
if (lf) lf.addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('user').value.trim(), p = pw.value;
  if (!u || !p) { $('err').textContent = 'Enter your username and password.'; return; }
  $('err').textContent = '';
  const r = await runLoader(lf, ['Securing connection…', 'Sending credentials…', 'Checking password hash (bcrypt)…', 'Creating secure session…'], post('/api/login', { username: u, password: p }));
  if (!r.ok) return fail(lf, r.body.error || 'Login failed.');
  success('ACCESS GRANTED — Welcome, ' + r.body.username + '!');
  setTimeout(() => location.href = '/', 1300);
});

/* SIGN UP */
const sf = $('signupForm');
if (sf) sf.addEventListener('submit', async e => {
  e.preventDefault();
  const u = $('user').value.trim(), em = $('email').value.trim(), p = pw.value;
  if (!/^[A-Za-z0-9_]{3,20}$/.test(u)) return $('err').textContent = 'Username: 3-20 letters, numbers or underscore.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) return $('err').textContent = 'Enter a valid email address.';
  if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)) return $('err').textContent = 'Password needs 8+ characters with a letter and a number.';
  if (p !== $('pw2').value) return $('err').textContent = 'Passwords do not match.';
  $('err').textContent = '';
  const r = await runLoader(sf, ['Validating details…', 'Hashing password (bcrypt)…', 'Saving to database…', 'Finalizing account…'], post('/api/signup', { username: u, email: em, password: p }));
  if (!r.ok) return fail(sf, r.body.error || 'Sign up failed.');
  success('ACCOUNT CREATED — Redirecting to login…');
  setTimeout(() => location.href = 'login.html?registered=1', 1300);
});

/* FORGOT PASSWORD */
const ff = $('forgotForm');
if (ff) ff.addEventListener('submit', async e => {
  e.preventDefault();
  const id = $('user').value.trim(), out = $('res'), btn = ff.querySelector('button');
  if (!id) { $('err').textContent = 'Enter your username or email.'; return; }
  $('err').textContent = ''; out.textContent = ''; btn.disabled = true; btn.textContent = 'WORKING…';
  const r = await post('/api/forgot', { identifier: id });
  btn.disabled = false; btn.textContent = 'CREATE RESET LINK';
  if (!r.ok) { $('err').textContent = r.body.error || 'Something went wrong.'; return; }
  out.textContent = r.body.message;
  if (r.body.demoLink) {
    const a = document.createElement('a');
    a.href = r.body.demoLink; a.textContent = '👉 Click here to reset your password';
    a.style.display = 'block'; a.style.marginTop = '10px';
    const note = document.createElement('small');
    note.textContent = 'Demo mode: a real site would email this link instead of showing it here.';
    note.style.display = 'block'; note.style.marginTop = '6px'; note.style.color = 'var(--dim)';
    out.append(a, note);
  }
});

/* RESET PASSWORD */
const rf = $('resetForm');
if (rf) rf.addEventListener('submit', async e => {
  e.preventDefault();
  const token = new URLSearchParams(location.search).get('token') || '', p = pw.value;
  if (p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p)) return $('err').textContent = 'Password needs 8+ characters with a letter and a number.';
  if (p !== $('pw2').value) return $('err').textContent = 'Passwords do not match.';
  $('err').textContent = '';
  const r = await post('/api/reset', { token, password: p });
  if (!r.ok) { $('err').textContent = r.body.error || 'Could not reset password.'; return; }
  location.href = 'login.html?reset=1';
});