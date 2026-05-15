const settingsService = require('../services/settingsService');
const { updateSettingsSchema } = require('../validators/settingsValidator');

async function getSettings(req, res) {
  const settings = await settingsService.getSettings(req.user.id);
  res.json(settings || {});
}

async function updateSettings(req, res) {
  const validated = updateSettingsSchema.parse(req.body);
  const updated = await settingsService.updateSettings(req.user.id, validated);
  res.json(updated);
}

module.exports = { getSettings, updateSettings };