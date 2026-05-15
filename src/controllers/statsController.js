const statsService = require('../services/statsService');

async function getDashboardStats(req, res) {
  const stats = await statsService.getDashboardStats();
  res.json(stats);
}

module.exports = { getDashboardStats };