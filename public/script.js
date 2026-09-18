  // ── Navigation ──
  function goTo(page) {
  if ((page === 'dashboard' || page === 'profile') && !currentUser) {
    openAuth('login'); return;
  }
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  window.scrollTo(0, 0);
  if (page === 'dashboard') loadDashboard();
  if (page === 'booking') resetBookingFlow();
}
  function scrollToServices() {
    goTo('home');
    setTimeout(() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' }), 50);
  }
  function toggleMenu() {
  document.querySelector('.nav-links').classList.toggle('mobile-open');
}
function closeMobileMenu() {
  document.querySelector('.nav-links').classList.remove('mobile-open');
}

document.querySelector('.nav-links').addEventListener('click', () => {
  if (window.innerWidth <= 640) closeMobileMenu();
});

document.addEventListener('click', (e) => {
  const navLinks = document.querySelector('.nav-links');
  const hamburger = document.querySelector('.nav-hamburger');
  if (navLinks.classList.contains('mobile-open') &&
      !navLinks.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMobileMenu();
  }
});
 
  // ── Booking state ──
  let state = { service: null, price: null, duration: null, date: null, time: null };
 
  function pickService(el, name, price, duration) {
    document.querySelectorAll('.svc-opt').forEach(o => o.classList.remove('picked'));
    el.classList.add('picked');
    state.service = name; state.price = price; state.duration = duration;
    updateSummary(); updateStepBar();
  }
 
  // ── Calendar ──
  const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  let calYear = 2026, calMonth = 5;
  const UNAVAILABLE = [3, 7, 14, 18, 25];
  const TIMES = ['9:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00'];
  const TAKEN = ['9:00','12:00','15:00'];
 
  function renderCal() {
    document.getElementById('cal-label').textContent = MONTHS[calMonth] + ' ' + calYear;
    const days = document.getElementById('cal-days');
    days.innerHTML = '';
    const first = new Date(calYear, calMonth, 1).getDay();
    const offset = first === 0 ? 6 : first - 1;
    const total = new Date(calYear, calMonth + 1, 0).getDate();
    const today = new Date(); const todayD = today.getDate(), todayM = today.getMonth(), todayY = today.getFullYear();
    for (let i = 0; i < offset; i++) { const e = document.createElement('div'); e.className = 'cal-cell empty'; days.appendChild(e); }
    for (let d = 1; d <= total; d++) {
      const e = document.createElement('div');
      const isPast = new Date(calYear, calMonth, d) < new Date(todayY, todayM, todayD);
      const isTodayDay = d === todayD && calMonth === todayM && calYear === todayY;
      e.className = 'cal-cell' + (isPast ? ' past' : '') + (isTodayDay ? ' today' : '');
      if (state.date && state.date.d === d && state.date.m === calMonth && state.date.y === calYear) e.classList.add('selected');
      e.textContent = d;
      if (!isPast) e.onclick = () => pickDate(d, calMonth, calYear, e);
      days.appendChild(e);
    }
  }
 
  function pickDate(d, m, y, el) {
    document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
    state.date = { d, m, y }; state.time = null;
    renderTimes(); updateSummary(); updateStepBar();
  }
 
  function renderTimes() {
    const ts = document.getElementById('time-section');
    const tg = document.getElementById('time-grid');
    ts.style.display = 'block'; tg.innerHTML = '';
    TIMES.forEach(t => {
      const btn = document.createElement('button');
      btn.className = 'time-btn' + (TAKEN.includes(t) ? ' taken' : '');
      btn.textContent = t;
      if (!TAKEN.includes(t)) btn.onclick = () => pickTime(t, btn);
      tg.appendChild(btn);
    });
  }
 
  function pickTime(t, el) {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('chosen'));
    el.classList.add('chosen');
    state.time = t; updateSummary(); updateStepBar();
  }
 
  function changeMonth(dir) {
    calMonth += dir;
    if (calMonth > 11) { calMonth = 0; calYear++; }
    if (calMonth < 0) { calMonth = 11; calYear--; }
    renderCal();
  }
 
  // ── Summary ──
  function updateSummary() {
    const el = document.getElementById('summary-content');
    const btn = document.getElementById('btn-confirm');
    let html = '';
    if (state.service) {
      html += `<div class="summary-row"><span>Service</span><span>${state.service}</span></div>`;
      html += `<div class="summary-row"><span>Duration</span><span>${state.duration}</span></div>`;
    }
    if (state.date) {
      const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      html += `<div class="summary-row"><span>Date</span><span>${state.date.d} ${months[state.date.m]} ${state.date.y}</span></div>`;
    }
    if (state.time) html += `<div class="summary-row"><span>Time</span><span>${state.time}</span></div>`;
    if (state.service) { html += `<div class="summary-divider"></div><div class="summary-row summary-total"><span>Total</span><span>${state.price}</span></div>`; }
    el.innerHTML = html || '<p class="summary-empty">No service selected yet</p>';
    btn.disabled = !(state.service && state.date && state.time);
  }
 
  function updateStepBar() {
    const svc = !!state.service, dt = !!(state.date && state.time);
    ['1','2','3'].forEach(n => {
      document.getElementById('bsn'+n).className = 'bs-num';
      document.getElementById('bsl'+n).className = 'bs-label';
    });
    if (svc) { document.getElementById('bsn1').classList.add('done'); document.getElementById('bsl1').classList.add('active'); }
    else { document.getElementById('bsn1').classList.add('active'); document.getElementById('bsl1').classList.add('active'); }
    if (dt) { document.getElementById('bsn2').classList.add('done'); document.getElementById('bsl2').classList.add('active'); }
    else if (svc) { document.getElementById('bsn2').classList.add('active'); document.getElementById('bsl2').classList.add('active'); }
    if (svc && dt) { document.getElementById('bsn3').classList.add('active'); document.getElementById('bsl3').classList.add('active'); }
  }
 
  async function confirmBooking() {
  if (!(state.service && state.date && state.time)) return;
  if (!currentUser) { openAuth('login'); return; }

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dateStr = `${state.date.y}-${String(state.date.m + 1).padStart(2,'0')}-${String(state.date.d).padStart(2,'0')}`;

  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service_name: state.service,
        price: state.price,
        duration: state.duration,
        booking_date: dateStr,
        booking_time: state.time
      })
    });
    if (!res.ok) { showToast('Something went wrong — please try again.'); return; }

    document.getElementById('confirm-details').innerHTML = `
      <div class="summary-row"><span>Service</span><span>${state.service}</span></div>
      <div class="summary-row"><span>Date</span><span>${state.date.d} ${months[state.date.m]} ${state.date.y}</span></div>
      <div class="summary-row"><span>Time</span><span>${state.time}</span></div>
      <div class="summary-divider"></div>
      <div class="summary-row summary-total"><span>Total</span><span>${state.price}</span></div>
    `;
    document.getElementById('booking-form').style.display = 'none';
    document.getElementById('confirm-screen').classList.add('show');
    ['1','2','3'].forEach(n => { document.getElementById('bsn'+n).className = 'bs-num done'; });
    showToast('Booking confirmed!');
  } catch (err) {
    showToast('Something went wrong — please try again.');
  }
}
 
  // ── Cancel appointments ──
  document.querySelectorAll('.appt-cancel').forEach(btn => {
    btn.addEventListener('click', function() {
      if (confirm('Cancel this appointment?')) this.closest('.appt-row').style.opacity = '0.4';
    });
  });
 
  // ── Init ──
  renderCal();

  // ── Real backend auth ──
let currentUser = null;

async function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Incorrect email or password.';
      errEl.classList.add('show');
      return;
    }
    errEl.classList.remove('show');
    loginSuccess(data, false);
  } catch (err) {
    errEl.textContent = 'Something went wrong. Please try again.';
    errEl.classList.add('show');
  }
}

async function handleRegister() {
  const name = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pw = document.getElementById('reg-password').value;
  const pw2 = document.getElementById('reg-password2').value;
  const errEl = document.getElementById('reg-error');

  if (!name || !email || !pw) { errEl.textContent = 'Please fill in all fields.'; errEl.classList.add('show'); return; }
  if (pw.length < 8) { errEl.textContent = 'Password must be at least 8 characters.'; errEl.classList.add('show'); return; }
  if (pw !== pw2) { errEl.textContent = 'Passwords do not match.'; errEl.classList.add('show'); return; }

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pw })
    });
    const data = await res.json();

    if (!res.ok) {
      errEl.textContent = data.error || 'Something went wrong.';
      errEl.classList.add('show');
      return;
    }
    errEl.classList.remove('show');
    loginSuccess(data, true);
  } catch (err) {
    errEl.textContent = 'Something went wrong. Please try again.';
    errEl.classList.add('show');
  }
}

async function logout() {
  await fetch('/api/logout', { method: 'POST' });
  currentUser = null;
  closeUserMenu();
  const btn = document.getElementById('nav-user-btn');
  btn.classList.remove('logged-in');
  btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.25"/><circle cx="9" cy="10" r="1" fill="currentColor" stroke="none"/><circle cx="15" cy="10" r="1" fill="currentColor" stroke="none"/><path d="M8 14.25c1 1.5 2.5 2.25 4 2.25s3-.75 4-2.25"/></svg>';
  goTo('home');
}

// Check if already logged in when the page loads (e.g. after refresh)
async function checkSession() {
  try {
    const res = await fetch('/api/me');
    if (res.ok) {
      const data = await res.json();
      currentUser = data;
      updateNavForUser(data);
      updateProfilePage(data);
    }
  } catch (err) {
    // not logged in, do nothing
  }
}
checkSession();

function openAuth(mode = 'login') {
  switchAuth(mode);
  document.getElementById('auth-modal').classList.add('open');
}
function closeAuth() { document.getElementById('auth-modal').classList.remove('open'); }
function switchAuth(mode) {
  document.getElementById('auth-login').style.display = mode === 'login' ? 'block' : 'none';
  document.getElementById('auth-register').style.display = mode === 'register' ? 'block' : 'none';
  document.getElementById('login-error').classList.remove('show');
  document.getElementById('reg-error').classList.remove('show');
}
function togglePw(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.textContent = inp.type === 'password' ? '👁' : '🙈';
}

function loginSuccess(user, isNew = false) {
  currentUser = user;
  closeAuth();
  updateNavForUser(user);
  updateProfilePage(user);
  showToast(isNew ? 'Account created — welcome to BookEase!' : 'Welcome back, ' + user.name.split(' ')[0] + '!');
}

function updateNavForUser(user) {
  const btn = document.getElementById('nav-user-btn');
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  btn.classList.add('logged-in');
  btn.textContent = initials;
  document.getElementById('nav-dropdown-user').innerHTML =
    `<div class="nav-dropdown-name">${user.name}</div><div class="nav-dropdown-email">${user.email}</div>`;
}

function updateProfilePage(user) {
  const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
  document.getElementById('profile-avatar-lg').textContent = initials;
  document.getElementById('profile-name').textContent = user.name;
  document.getElementById('profile-email-display').textContent = user.email;
  document.getElementById('pf-name').textContent = user.name;
  document.getElementById('pf-email').textContent = user.email;
}

function toggleUserMenu() {
  if (!currentUser) { openAuth('login'); return; }
  document.getElementById('nav-dropdown').classList.toggle('open');
}
function closeUserMenu() { document.getElementById('nav-dropdown').classList.remove('open'); }

document.addEventListener('click', e => {
  if (!document.getElementById('nav-user-btn').contains(e.target) &&
      !document.getElementById('nav-dropdown').contains(e.target)) closeUserMenu();
});

// ── Toast notifications ──
function showToast(message) {
  const existing = document.getElementById('toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.id = 'toast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; top: 80px; left: 50%; transform: translateX(-50%) translateY(-20px);
    background: var(--green-base); color: #fff;
    padding: 14px 32px; border-radius: var(--radius);
    font-family: var(--font-body); font-size: 15px; font-weight: 500;
    box-shadow: 0 12px 40px rgba(4,52,44,0.35);
    z-index: 999; opacity: 0;
    transition: opacity 0.3s, transform 0.3s;
    white-space: nowrap;
    letter-spacing: 0.01em;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function submitContact() {
  const name = document.getElementById('contact-name').value.trim();
  const email = document.getElementById('contact-email').value.trim();
  const msg = document.getElementById('contact-msg').value.trim();
  if (!name || !email || !msg) { showToast('Please fill in all fields.'); return; }
  document.getElementById('contact-name').value = '';
  document.getElementById('contact-email').value = '';
  document.getElementById('contact-msg').value = '';
  showToast('Message sent — we\'ll get back to you soon!');
}

const SERVICE_ICONS = {
  'Haircut & styling': '✂️', 'Facial treatment': '✨',
  'Relaxation massage': '🤲', 'Manicure & nails': '💅'
};

async function loadDashboard() {
  if (currentUser) document.getElementById('dash-greeting-name').textContent = currentUser.name.split(' ')[0];
  
  const res = await fetch('/api/bookings');
  if (!res.ok) return;
  const bookings = await res.json();

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter(b => b.status !== 'cancelled' && b.booking_date >= today);
  const past = bookings.filter(b => b.booking_date < today || b.status === 'cancelled');

  document.getElementById('stat-upcoming').textContent = upcoming.length;
  document.querySelectorAll('.stat-num')[1].textContent = past.filter(b => b.status !== 'cancelled').length;
  document.querySelectorAll('.stat-num')[2].textContent = bookings.filter(b => b.status === 'cancelled').length;

  const upcomingEl = document.getElementById('upcoming-list');
  upcomingEl.innerHTML = upcoming.length ? upcoming.map(renderApptRow).join('') : '<p class="summary-empty">No upcoming appointments.</p>';

  const pastEl = document.getElementById('past-list');
  pastEl.innerHTML = past.length ? past.map(renderApptRow).join('') : '<p class="summary-empty">No past appointments yet.</p>';

  document.querySelectorAll('.appt-cancel').forEach(btn => {
    btn.addEventListener('click', async function() {
      if (!confirm('Cancel this appointment?')) return;
      await fetch(`/api/bookings/${this.dataset.id}/cancel`, { method: 'PATCH' });
      loadDashboard();
    });
  });
}

function renderApptRow(b) {
  const badge = b.status === 'cancelled' ? '<span class="badge badge-gray">Cancelled</span>'
    : b.booking_date < new Date().toISOString().split('T')[0] ? '<span class="badge badge-gray">Completed</span>'
    : '<span class="badge badge-green">Confirmed</span>';
  const cancelBtn = b.status !== 'cancelled' ? `<button class="appt-cancel" data-id="${b.id}">Cancel</button>` : '';

  return `
    <div class="appt-row">
      <div class="appt-icon-wrap">${SERVICE_ICONS[b.service_name] || '📅'}</div>
      <div class="appt-info">
        <div class="appt-name">${b.service_name}</div>
        <div class="appt-when">📅 ${b.booking_date} · ${b.booking_time}</div>
      </div>
      ${badge}
      ${cancelBtn}
    </div>
  `;
}

function resetBookingFlow() {
  state = { service: null, price: null, duration: null, date: null, time: null };
  document.querySelectorAll('.svc-opt').forEach(o => o.classList.remove('picked'));
  document.getElementById('time-section').style.display = 'none';
  document.getElementById('time-grid').innerHTML = '';
  document.getElementById('booking-form').style.display = '';
  document.getElementById('confirm-screen').classList.remove('show');
  renderCal();
  updateSummary();
  updateStepBar();
}