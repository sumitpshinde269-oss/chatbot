const prisma = require('../config/database');

async function getDashboardStats() {
  const [totalPosts, activeAlerts, avgConfidence] = await Promise.all([
    prisma.post.count(),
    prisma.alert.count({ where: { status: 'active' } }),
    prisma.post.aggregate({ _avg: { confidence: true } }),
  ]);
  return {
    totalPosts,
    activeAlerts,
    avgConfidence: avgConfidence._avg.confidence || 0,
  };
}

module.exports = { getDashboardStats };