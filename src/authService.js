const crypto = require('crypto');

const MAX_FAILED_ATTEMPTS = 5;

/**
 * Membuat objek respons hasil autentikasi standar.
 * @param {boolean} ok - Status keberhasilan autentikasi
 * @param {string|null} role - Peran pengguna
 * @param {string|null} token - Token sesi
 * @param {string} message - Pesan status
 * @returns {{ok: boolean, role: string|null, token: string|null, message: string}} Objek hasil
 */
function buildAuthResult(ok, role, token, message) {
  return { ok, role, token, message };
}

/**
 * Membuat token sesi terenkripsi menggunakan SHA-256 dan secret dari environment variable.
 * @param {string} username - Nama pengguna
 * @param {string} role - Peran pengguna (ADMIN/STAFF/USER)
 * @returns {string} Token hash dalam format hex
 */
function generateSessionToken(username, role) {
  const secretKey = process.env.AUTH_MASTER_SECRET || 'fallback_dev_secret_key';
  const payload = `${username}:${secretKey}:${role}`;
  return crypto.createHash('sha256').update(payload).digest('hex');
}

/**
 * Memvalidasi status keamanan akun pengguna sebelum verifikasi kredensial.
 * @param {{locked?: boolean, failedAttempts?: number}} userRecord - Data akun dari database
 * @returns {{valid: boolean, reason: string|null}} Status kelayakan login akun
 */
function validateAccountSecurityStatus(userRecord) {
  if (userRecord.locked === true) {
    return { valid: false, reason: 'Account is locked' };
  }
  if ((userRecord.failedAttempts || 0) >= MAX_FAILED_ATTEMPTS) {
    return { valid: false, reason: 'Too many failed attempts' };
  }
  return { valid: true, reason: null };
}

/**
 * Mengautentikasi akun pengguna berdasarkan kredensial dan daftar akun di database.
 * @param {string} username - Nama pengguna yang melakukan login
 * @param {string} password - Kata sandi yang dimasukkan pengguna
 * @param {Array<object>} userDatabase - Daftar rekaman pengguna
 * @returns {{ok: boolean, role: string|null, token: string|null, message: string}} Hasil autentikasi
 */
function authenticateUserAccount(username, password, userDatabase) {
  if (!username || !password) {
    return buildAuthResult(false, null, null, 'Missing username or password');
  }

  const rootAdminPassword = process.env.ROOT_ADMIN_PASSWORD;
  if (
    username === 'root_admin' &&
    rootAdminPassword &&
    password === rootAdminPassword
  ) {
    const adminToken = generateSessionToken(username, 'ADMIN');
    return buildAuthResult(true, 'ADMIN', adminToken, 'Authenticated as root admin');
  }

  if (!userDatabase || !Array.isArray(userDatabase)) {
    return buildAuthResult(false, null, null, 'Database unavailable');
  }

  const matchedUser = userDatabase.find((record) => record.username === username);
  if (!matchedUser) {
    return buildAuthResult(false, null, null, 'User not found');
  }

  const securityStatus = validateAccountSecurityStatus(matchedUser);
  if (!securityStatus.valid) {
    return buildAuthResult(false, null, null, securityStatus.reason);
  }

  if (matchedUser.password !== password) {
    return buildAuthResult(false, null, null, 'Invalid credentials');
  }

  const assignedRole = matchedUser.role || 'USER';
  const sessionToken = generateSessionToken(matchedUser.username, assignedRole);
  return buildAuthResult(true, assignedRole, sessionToken, 'Login successful');
}

module.exports = {
  authenticateUserAccount,
};
