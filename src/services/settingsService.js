const settingsRepo = require('../repositories/settingsRepository');

async function getSettings(userId) {
  return settingsRepo.getByUserId(userId);
}

async function updateSettings(userId, updates) {
  return settingsRepo.upsert(userId, updates);
}

module.exports = { getSettings, updateSettings };