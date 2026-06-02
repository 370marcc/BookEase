  // ── Navigation ──
  function goTo(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('page-' + page).classList.add('active');
    window.scrollTo(0, 0);
  }
  function scrollToServices() {
    goTo('home');
    setTimeout(() => document.getElementById('services').scrollIntoView({ behavior: 'smooth' }), 50);
  }
  function toggleMenu() {
    const links = document.querySelector('.nav-links');
    links.style.display = links.style.display === 'flex' ? 'none' : 'flex';
    links.style.flexDirection = 'column';
    links.style.position = 'absolute';
    links.style.top = '64px';
    links.style.left = '0'; links.style.right = '0';
    links.style.background = 'var(--cream)';
    links.style.padding = '1rem 1.5rem';
    links.style.borderBottom = '1px solid var(--cream-dark)';
    links.style.gap = '1rem';
  }
 
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
 
  function confirmBooking() {
    if (!(state.service && state.date && state.time)) return;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
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
  }
 
  // ── Cancel appointments ──
  document.querySelectorAll('.appt-cancel').forEach(btn => {
    btn.addEventListener('click', function() {
      if (confirm('Cancel this appointment?')) this.closest('.appt-row').style.opacity = '0.4';
    });
  });
 
  // ── Init ──
  renderCal();