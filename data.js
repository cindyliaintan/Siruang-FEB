/**
 * data.js — SiRuang FEB
 * Definisi data master: ruangan, slot waktu, kelas, organisasi
 */

// ── Ruangan ─────────────────────────────────────────────────────────────────
const ROOMS = [
  // Lantai 1
  { id: 'C1.001', floor: 1, capacity: 40 },
  { id: 'C1.002', floor: 1, capacity: 40 },
  { id: 'C1.003', floor: 1, capacity: 40 },
  { id: 'C1.004', floor: 1, capacity: 40 },
  { id: 'C1.005', floor: 1, capacity: 40 },
  { id: 'C1.006', floor: 1, capacity: 40 },
  { id: 'C1.007', floor: 1, capacity: 40 },
  { id: 'C1.008', floor: 1, capacity: 40 },
  { id: 'C1.009', floor: 1, capacity: 40 },
  { id: 'C1.010', floor: 1, capacity: 40 },
  { id: 'C1.011', floor: 1, capacity: 40 },
  { id: 'C1.012', floor: 1, capacity: 40 },
  // Lantai 2
  { id: 'C2.013', floor: 2, capacity: 40 },
  { id: 'C2.014', floor: 2, capacity: 40 },
  { id: 'C2.015', floor: 2, capacity: 40 },
  { id: 'C2.016', floor: 2, capacity: 40 },
  { id: 'C2.017', floor: 2, capacity: 40 },
  { id: 'C2.018', floor: 2, capacity: 40 },
  { id: 'C2.019', floor: 2, capacity: 40 },
  { id: 'C2.020', floor: 2, capacity: 40 },
  { id: 'C2.021', floor: 2, capacity: 40 },
  { id: 'C2.022', floor: 2, capacity: 40 },
];

// ── Slot Waktu ───────────────────────────────────────────────────────────────
// 5 slot × 2 jam = 10 jam (07:00-17:00 dengan jeda 12:00-13:00)
const TIME_SLOTS = [
  { id: 0, label: '07:00 – 09:00', start: '07:00', end: '09:00', session: 'pagi' },
  { id: 1, label: '09:00 – 11:00', start: '09:00', end: '11:00', session: 'pagi' },
  { id: 2, label: '11:00 – 13:00', start: '11:00', end: '13:00', session: 'pagi' },
  { id: 3, label: '13:00 – 15:00', start: '13:00', end: '15:00', session: 'siang' },
  { id: 4, label: '15:00 – 17:00', start: '15:00', end: '17:00', session: 'siang' },
];

// ── Status Ruangan ───────────────────────────────────────────────────────────
const ROOM_STATUS = {
  AVAILABLE: 'available',
  OCCUPIED:  'occupied',
  ORG:       'org',
  BOOKED:    'booked',
  CANCELLED: 'cancelled',
};

// ── Organisasi ───────────────────────────────────────────────────────────────
const ORGANIZATIONS = ['BEM', 'BLM', 'HIMMAS', 'HIMAKASI'];

// ── Prodi & Kelas ────────────────────────────────────────────────────────────
const PRODI = ['Manajemen', 'Akuntansi'];
const KELAS = ['A', 'B', 'C', 'D', 'E', 'F'];
const SEMESTERS = [1, 3, 5, 7];

// ── Batas Penggunaan ─────────────────────────────────────────────────────────
const MAX_SESSIONS_PER_CLASS_PER_DAY = 3;

// ── LocalStorage Key ─────────────────────────────────────────────────────────
const STORAGE_KEY_BOOKINGS = 'feb_bookings_v2';
const STORAGE_KEY_LOG      = 'feb_log_v2';
