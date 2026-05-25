/**
 * app.js — SiRuang FEB
 * Logika utama aplikasi manajemen ruang kelas
 *
 * STRUKTUR:
 *  1. State management (load/save ke localStorage)
 *  2. Helpers
 *  3. Dashboard render
 *  4. Timeline render
 *  5. Modal (detail ruangan + quick-book)
 *  6. Form booking
 *  7. Log
 *  8. Navigasi & init
 */

// ═══════════════════════════════════════════════════════════
//  1. STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════

/**
 * Format booking:
 * {
 *   id: string (uuid),
 *   roomId: string,
 *   slotId: number,
 *   date: string (YYYY-MM-DD),
 *   type: 'academic' | 'org' | 'exam' | 'extra',
 *   status: 'active' | 'cancelled',
 *   prodi: string,
 *   semester: number,
 *   kelas: string,
 *   org: string,
 *   kegiatan: string,
 *   dosen: string,
 *   note: string,
 *   createdAt: string (ISO),
 *   cancelledAt: string | null,
 * }
 */

function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_BOOKINGS) || '[]');
  } catch { return []; }
}

function saveBookings(list) {
  localStorage.setItem(STORAGE_KEY_BOOKINGS, JSON.stringify(list));
}

function loadLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_LOG) || '[]');
  } catch { return []; }
}

function saveLog(list) {
  localStorage.setItem(STORAGE_KEY_LOG, JSON.stringify(list));
}

function addLog(text, color = '#8090a4') {
  const log = loadLog();
  log.unshift({
    id: uuid(),
    text,
    color,
    time: new Date().toLocaleString('id-ID'),
  });
  saveLog(log.slice(0, 200)); // simpan maks 200 entri
}

// ═══════════════════════════════════════════════════════════
//  2. HELPERS
// ═══════════════════════════════════════════════════════════

function uuid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

/** Menentukan slot waktu aktif berdasarkan jam sekarang */
function getCurrentSlotId() {
  const h = new Date().getHours();
  const m = new Date().getMinutes();
  const mins = h * 60 + m;
  if (mins >= 7*60  && mins < 9*60)  return 0;
  if (mins >= 9*60  && mins < 11*60) return 1;
  if (mins >= 11*60 && mins < 13*60) return 2;
  if (mins >= 13*60 && mins < 15*60) return 3;
  if (mins >= 15*60 && mins < 17*60) return 4;
  return -1; // di luar jam operasional
}

/** Mengambil booking aktif untuk ruang + slot + tanggal tertentu */
function getActiveBooking(roomId, slotId, date) {
  return loadBookings().find(
    b => b.roomId === roomId &&
         b.slotId === slotId &&
         b.date   === date &&
         b.status === 'active'
  ) || null;
}

/** Status sebuah slot ruangan pada tanggal tertentu */
function getSlotStatus(roomId, slotId, date) {
  const b = getActiveBooking(roomId, slotId, date);
  if (!b) return ROOM_STATUS.AVAILABLE;
  if (b.type === 'org') return ROOM_STATUS.ORG;
  return ROOM_STATUS.OCCUPIED;
}

/** Status "representative" sebuah ruangan (untuk slot aktif atau slot tertentu) */
function getRoomDisplayStatus(roomId, slotId, date) {
  if (slotId < 0) return ROOM_STATUS.AVAILABLE;
  return getSlotStatus(roomId, slotId, date);
}

/** Cek apakah sebuah kelas sudah mencapai batas sesi per hari */
function classSessionCount(prodi, semester, kelas, date) {
  return loadBookings().filter(
    b => b.status === 'active' &&
         b.date === date &&
         b.prodi === prodi &&
         b.semester == semester &&
         b.kelas === kelas
  ).length;
}

/** Format label untuk display booking */
function bookingLabel(b) {
  if (b.type === 'org') return b.org + ' – ' + b.kegiatan;
  if (b.type === 'exam') return `Ujian ${b.prodi} Sem.${b.semester} Kelas ${b.kelas}`;
  if (b.type === 'academic') return `${b.prodi} Sem.${b.semester} Kelas ${b.kelas}`;
  return b.kegiatan || 'Kegiatan Tambahan';
}

function statusBadgeHtml(status) {
  const map = {
    available: ['badge-available', '● Tersedia'],
    occupied:  ['badge-occupied',  '● Digunakan'],
    org:       ['badge-org',       '● Organisasi'],
    booked:    ['badge-booked',    '● Dipesan'],
    cancelled: ['badge-cancelled', '● Dibatalkan'],
  };
  const [cls, label] = map[status] || map.available;
  return `<span class="room-status-badge ${cls}">${label}</span>`;
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('toast');
  const icons = { success: '✓', error: '✗', info: 'ℹ' };
  t.innerHTML = `<span>${icons[type]}</span> ${msg}`;
  t.className = `toast show ${type}`;
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.className = 'toast'; }, 3500);
}

// ═══════════════════════════════════════════════════════════
//  3. DASHBOARD RENDER
// ═══════════════════════════════════════════════════════════

function renderDashboard() {
  const filterFloor = document.getElementById('filter-floor').value;
  const filterSlotVal = document.getElementById('filter-slot').value;

  const today = todayStr();
  let slotId;
  if (filterSlotVal === 'current') slotId = getCurrentSlotId();
  else if (filterSlotVal === 'all') slotId = null;
  else slotId = parseInt(filterSlotVal, 10);

  // Stats
  let total = 0, avail = 0, occ = 0, org = 0;
  ROOMS.forEach(r => {
    if (filterFloor !== 'all' && r.floor !== parseInt(filterFloor)) return;
    total++;
    if (slotId === null || slotId < 0) { avail++; return; }
    const s = getRoomDisplayStatus(r.id, slotId, today);
    if (s === ROOM_STATUS.AVAILABLE) avail++;
    else if (s === ROOM_STATUS.ORG) org++;
    else occ++;
  });

  const slotNote = slotId !== null && slotId >= 0 ? ` (${TIME_SLOTS[slotId]?.label})` : '';
  document.getElementById('stats-bar').innerHTML = `
    <div class="stat-card s-total">
      <div class="stat-left">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Total Ruangan</div>
      </div>
      <div class="stat-icon">🏫</div>
    </div>
    <div class="stat-card s-available">
      <div class="stat-left">
        <div class="stat-value">${avail}</div>
        <div class="stat-label">Tersedia${slotNote}</div>
      </div>
      <div class="stat-icon">🕐</div>
    </div>
    <div class="stat-card s-occupied">
      <div class="stat-left">
        <div class="stat-value">${occ}</div>
        <div class="stat-label">Sedang Digunakan</div>
      </div>
      <div class="stat-icon">🔴</div>
    </div>
    <div class="stat-card s-org">
      <div class="stat-left">
        <div class="stat-value">${org}</div>
        <div class="stat-label">Kegiatan Organisasi</div>
      </div>
      <div class="stat-icon">👥</div>
    </div>
    <div class="stat-card s-booked">
      <div class="stat-left">
        <div class="stat-value">${loadBookings().filter(b=>b.date===today && b.status==='active').length}</div>
        <div class="stat-label">Booking Hari Ini</div>
      </div>
      <div class="stat-icon">📅</div>
    </div>
  `;

  // Floor sections
  [1, 2].forEach(floor => {
    const section = document.getElementById(`floor${floor}-section`);
    const grid = document.getElementById(`grid-floor${floor}`);
    section.style.display = (filterFloor === 'all' || filterFloor == floor) ? 'block' : 'none';

    const rooms = ROOMS.filter(r => r.floor === floor);
    grid.innerHTML = rooms.map(r => renderRoomCard(r, slotId, today)).join('');
  });
}

function renderRoomCard(room, slotId, date) {
  // Slot pips: status tiap slot
  const pips = TIME_SLOTS.map(sl => {
    const s = getSlotStatus(room.id, sl.id, date);
    const cls = s === ROOM_STATUS.AVAILABLE ? 's-available'
              : s === ROOM_STATUS.ORG       ? 's-org'
              : 's-occupied';
    return `<div class="slot-pip ${cls}" title="${sl.label}: ${s}"></div>`;
  }).join('');

  // Status utama (untuk slot aktif/dipilih)
  let displayStatus, booking = null;
  if (slotId === null || slotId < 0) {
    displayStatus = ROOM_STATUS.AVAILABLE;
  } else {
    displayStatus = getRoomDisplayStatus(room.id, slotId, date);
    booking = getActiveBooking(room.id, slotId, date);
  }

  let infoHtml = '';
  if (booking) {
    infoHtml = `
      <div class="room-info">
        <strong>${bookingLabel(booking)}</strong><br>
        ${booking.dosen ? `${booking.dosen}` : ''}
        ${booking.note ? `<br><em>${booking.note}</em>` : ''}
      </div>`;
  } else if (slotId !== null && slotId >= 0) {
    infoHtml = `<div class="room-info" style="color:var(--green)">Bebas digunakan</div>`;
  }

  return `
    <div class="room-card ${displayStatus}" onclick="openRoomModal('${room.id}')">
      <div class="room-number">${room.id}</div>
      ${statusBadgeHtml(displayStatus)}
      ${infoHtml}
      <div class="room-slots">${pips}</div>
    </div>`;
}

// ═══════════════════════════════════════════════════════════
//  4. TIMELINE RENDER
// ═══════════════════════════════════════════════════════════

function renderTimeline() {
  const filterFloor = document.getElementById('jadwal-floor').value;
  const today = todayStr();
  const bookings = loadBookings();

  const rooms = ROOMS.filter(r => filterFloor === 'all' || r.floor == parseInt(filterFloor));
  const colCount = 1 + TIME_SLOTS.length; // room label + 5 slots
  const gridCols = `110px repeat(${TIME_SLOTS.length}, 1fr)`;

  const headerCols = TIME_SLOTS.map(sl =>
    `<div class="tl-slot-label">${sl.label}</div>`
  ).join('');

  const rows = rooms.map(r => {
    const cells = TIME_SLOTS.map(sl => {
      const b = bookings.find(bk =>
        bk.roomId === r.id && bk.slotId === sl.id &&
        bk.date === today && bk.status === 'active'
      );
      let cellHtml;
      if (!b) {
        cellHtml = `<span class="tl-empty">–</span>`;
      } else {
        const cls = b.type === 'org' ? 'tl-org' : 'tl-occupied';
        const short = b.type === 'org'
          ? b.org
          : `${b.prodi?.slice(0,3)} ${b.kelas}`;
        cellHtml = `<div class="tl-badge ${cls}">${short}<br><small>${b.kegiatan?.slice(0,18) || ''}</small></div>`;
      }
      return `<div class="tl-slot-cell">${cellHtml}</div>`;
    }).join('');

    return `
      <div class="timeline-row" style="grid-template-columns:${gridCols}">
        <div class="tl-room-cell">${r.id}</div>
        ${cells}
      </div>`;
  }).join('');

  document.getElementById('timeline-container').innerHTML = `
    <div class="timeline-header" style="grid-template-columns:${gridCols}">
      <div class="tl-room-label">Ruangan</div>
      ${headerCols}
    </div>
    ${rows}
  `;
}

// ═══════════════════════════════════════════════════════════
//  5. MODAL — DETAIL RUANGAN
// ═══════════════════════════════════════════════════════════

function openRoomModal(roomId) {
  const room = ROOMS.find(r => r.id === roomId);
  const today = todayStr();
  const bookings = loadBookings();

  const slotRows = TIME_SLOTS.map(sl => {
    const b = bookings.find(bk =>
      bk.roomId === roomId && bk.slotId === sl.id &&
      bk.date === today && bk.status === 'active'
    );
    const isCurrent = sl.id === getCurrentSlotId();

    if (!b) {
      return `
        <div class="booking-slot-item">
          <div class="bsi-top">
            <span class="bsi-time">${sl.label}</span>
            ${isCurrent ? '<span class="current-slot-badge"><span class="pulse"></span> Sekarang</span>' : ''}
            <span class="bsi-status badge-available" style="background:var(--green-dim);color:var(--green);padding:3px 10px;border-radius:20px;font-size:0.72rem;font-weight:500;">Tersedia</span>
          </div>
          <button class="quick-book-btn" onclick="closeModal(); quickBook('${roomId}', ${sl.id})">+ Book slot ini</button>
        </div>`;
    }

    const label = bookingLabel(b);
    const typeColor = b.type === 'org' ? 'var(--cyan)' : 'var(--red)';
    return `
      <div class="booking-slot-item">
        <div class="bsi-top">
          <span class="bsi-time">${sl.label}</span>
          ${isCurrent ? '<span class="current-slot-badge"><span class="pulse"></span> Sekarang</span>' : ''}
          <span class="bsi-status" style="color:${typeColor};font-size:0.75rem;font-weight:500;">● ${b.type === 'org' ? 'Organisasi' : 'Digunakan'}</span>
        </div>
        <div class="bsi-detail">
          <strong>${label}</strong>
          ${b.dosen ? ` · ${b.dosen}` : ''}
          ${b.note ? `<br><em>${b.note}</em>` : ''}
        </div>
        <button class="btn-cancel-booking" style="margin-top:8px" onclick="cancelBooking('${b.id}')">Batalkan Booking Ini</button>
      </div>`;
  }).join('');

  document.getElementById('modal-content').innerHTML = `
    <div class="modal-title">${room.id}</div>
    <div class="modal-sub">Lantai ${room.floor} · Kapasitas ${room.capacity} orang</div>
    <div class="modal-section">
      <div class="modal-section-title">Status Slot — ${new Date().toLocaleDateString('id-ID', {weekday:'long',year:'numeric',month:'long',day:'numeric'})}</div>
      ${slotRows}
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('open');
}

function openBookingModal() {
  // Buka view booking langsung
  switchView('booking');
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// ═══════════════════════════════════════════════════════════
//  6. FORM BOOKING
// ═══════════════════════════════════════════════════════════

function populateRoomSelect(target = 'f-room') {
  const sel = document.getElementById(target);
  sel.innerHTML = '<option value="">-- Pilih Ruangan --</option>' +
    ROOMS.map(r => `<option value="${r.id}">${r.id} (Lt.${r.floor})</option>`).join('');
}

function toggleFormFields() {
  const type = document.getElementById('f-type').value;
  const isAcademic = type === 'academic' || type === 'exam';
  const isOrg = type === 'org';

  document.getElementById('fg-prodi').style.display    = isAcademic ? 'flex' : 'none';
  document.getElementById('fg-semester').style.display = isAcademic ? 'flex' : 'none';
  document.getElementById('fg-kelas').style.display    = isAcademic ? 'flex' : 'none';
  document.getElementById('fg-org').style.display      = isOrg ? 'flex' : 'none';
  document.getElementById('fg-dosen').style.display    = isAcademic ? 'flex' : 'none';
}

function resetBookingForm() {
  document.getElementById('main-booking-form').reset();
  toggleFormFields();
}

function submitBookingForm(e) {
  e.preventDefault();

  const type     = document.getElementById('f-type').value;
  const roomId   = document.getElementById('f-room').value;
  const slotId   = parseInt(document.getElementById('f-slot').value);
  const date     = document.getElementById('f-date').value;
  const prodi    = document.getElementById('f-prodi').value;
  const semester = document.getElementById('f-semester').value;
  const kelas    = document.getElementById('f-kelas').value;
  const org      = document.getElementById('f-org').value;
  const kegiatan = document.getElementById('f-kegiatan').value;
  const dosen    = document.getElementById('f-dosen').value;
  const note     = document.getElementById('f-note').value;

  // Validasi: ruangan sudah dibooking di slot yang sama?
  const existing = getActiveBooking(roomId, slotId, date);
  if (existing) {
    showToast(`${roomId} sudah dibooking untuk slot tersebut!`, 'error');
    return;
  }

  // Validasi: batas sesi kelas per hari (hanya untuk akademik)
  if ((type === 'academic' || type === 'exam') && prodi && semester && kelas) {
    const count = classSessionCount(prodi, parseInt(semester), kelas, date);
    if (count >= MAX_SESSIONS_PER_CLASS_PER_DAY) {
      showToast(`${prodi} Sem.${semester} Kelas ${kelas} sudah mencapai batas ${MAX_SESSIONS_PER_CLASS_PER_DAY} sesi/hari!`, 'error');
      return;
    }
  }

  const booking = {
    id: uuid(),
    roomId, slotId, date, type,
    status: 'active',
    prodi: (type === 'academic' || type === 'exam') ? prodi : '',
    semester: (type === 'academic' || type === 'exam') ? parseInt(semester) : null,
    kelas: (type === 'academic' || type === 'exam') ? kelas : '',
    org: type === 'org' ? org : '',
    kegiatan, dosen, note,
    createdAt: new Date().toISOString(),
    cancelledAt: null,
  };

  const list = loadBookings();
  list.push(booking);
  saveBookings(list);

  const slotLabel = TIME_SLOTS[slotId]?.label || '';
  addLog(
    `Booking: ${roomId} · ${slotLabel} · ${date} — ${bookingLabel(booking)}`,
    type === 'org' ? 'var(--cyan)' : 'var(--green)'
  );

  showToast(`Ruangan ${roomId} berhasil dibooking!`, 'success');
  resetBookingForm();
  switchView('dashboard');
}

/** Quick-book dari modal detail ruangan */
function quickBook(roomId, slotId) {
  switchView('booking');
  setTimeout(() => {
    document.getElementById('f-room').value = roomId;
    document.getElementById('f-slot').value = slotId;
    document.getElementById('f-date').value = todayStr();
  }, 100);
}

/** Membatalkan booking berdasarkan ID */
function cancelBooking(bookingId) {
  const list = loadBookings();
  const idx = list.findIndex(b => b.id === bookingId);
  if (idx === -1) return;
  const b = list[idx];
  b.status = 'cancelled';
  b.cancelledAt = new Date().toISOString();
  saveBookings(list);

  const slotLabel = TIME_SLOTS[b.slotId]?.label || '';
  addLog(
    `Dibatalkan: ${b.roomId} · ${slotLabel} · ${b.date} — ${bookingLabel(b)}`,
    'var(--red)'
  );

  showToast(`Booking ${b.roomId} dibatalkan. Slot terbuka untuk pengguna lain.`, 'info');
  closeModal();
  renderDashboard();
  renderLog();
}

// ═══════════════════════════════════════════════════════════
//  7. LOG
// ═══════════════════════════════════════════════════════════

function renderLog() {
  const log = loadLog();
  const container = document.getElementById('log-container');
  if (!log.length) {
    container.innerHTML = '<div class="log-empty">Belum ada aktivitas tercatat.</div>';
    return;
  }
  container.innerHTML = log.map(entry => `
    <div class="log-entry">
      <div class="log-dot" style="background:${entry.color}"></div>
      <div class="log-meta">
        <div class="log-time">${entry.time}</div>
        <div class="log-text">${entry.text}</div>
      </div>
    </div>
  `).join('');
}

function clearAllData() {
  if (!confirm('Hapus semua data booking dan log? Aksi ini tidak bisa dibatalkan.')) return;
  localStorage.removeItem(STORAGE_KEY_BOOKINGS);
  localStorage.removeItem(STORAGE_KEY_LOG);
  renderDashboard();
  renderLog();
  showToast('Semua data dihapus.', 'info');
}

// ═══════════════════════════════════════════════════════════
//  8. NAVIGASI & INIT
// ═══════════════════════════════════════════════════════════

function switchView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${name}`)?.classList.add('active');
  document.querySelector(`[data-view="${name}"]`)?.classList.add('active');

  // Render view yang relevan
  if (name === 'dashboard') renderDashboard();
  if (name === 'jadwal')    renderTimeline();
  if (name === 'log')       renderLog();
}

function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent =
    now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

function updateDateDisplay() {
  const now = new Date();
  const today = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
  const slotId = getCurrentSlotId();
  const slotText = slotId >= 0
    ? `<span class="current-slot-badge" style="margin-left:12px"><span class="pulse"></span> Slot aktif: ${TIME_SLOTS[slotId].label}</span>`
    : '<span style="color:var(--text-muted);font-size:0.8rem;margin-left:12px">Di luar jam operasional</span>';
  document.getElementById('date-display').innerHTML = today + slotText;
}

function init() {
  // Set tanggal default form
  document.getElementById('f-date').value = todayStr();
  populateRoomSelect('f-room');
  toggleFormFields();

  // Navigasi
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });

  // Filter dashboard
  document.getElementById('filter-floor').addEventListener('change', renderDashboard);
  document.getElementById('filter-slot').addEventListener('change', renderDashboard);
  document.getElementById('jadwal-floor').addEventListener('change', renderTimeline);

  // Inisialisasi
  renderDashboard();
  renderLog();
  updateClock();
  updateDateDisplay();

  // Interval
  setInterval(updateClock, 1000);
  setInterval(() => { updateDateDisplay(); renderDashboard(); }, 60_000);
}

document.addEventListener('DOMContentLoaded', init);
