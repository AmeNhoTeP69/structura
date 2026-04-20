const bcrypt = require('bcryptjs');

const BCRYPT_ROUNDS = 10;

function looksHashed(passwordHash) {
  return typeof passwordHash === 'string' && passwordHash.startsWith('$2');
}

async function hashPassword(password) {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

async function verifyPassword(password, passwordHash) {
  if (!passwordHash) return false;

  if (looksHashed(passwordHash)) {
    return bcrypt.compare(password, passwordHash);
  }

  return password === passwordHash;
}

module.exports = {
  looksHashed,
  hashPassword,
  verifyPassword,
};
