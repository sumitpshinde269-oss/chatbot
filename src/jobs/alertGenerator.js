const prisma = require('../config/database');
const { getIo } = require('../config/socket');

async function generateAlerts() {
  console.log('Running alert generator...');
  // Get all active user settings (could be per user, but for simplicity use first admin)
  const settings = await prisma.userSetting.findFirst();
  if (!settings) return;
  const threshold = settings.postThreshold;
  const windowMinutes = settings.timeWindowMinutes;
  const cutoff = new Date(Date.now() - windowMinutes * 60 * 1000);

  // Group posts by type and location (simplified: just by type)
  const posts = await prisma.post.findMany({
    where: { createdAt: { gte: cutoff }, severity: null },
  });
  const typeCounts = {};
  for (const post of posts) {
    if (!post.type) continue;
    typeCounts[post.type] = (typeCounts[post.type] || 0) + 1;
    if (typeCounts[post.type] >= threshold) {
      const existing = await prisma.alert.findFirst({
        where: { title: { contains: post.type }, createdAt: { gte: cutoff }, status: 'active' },
      });
      if (!existing) {
        const alert = await prisma.alert.create({
          data: {
            title: `Multiple ${post.type} reports`,
            description: `${typeCounts[post.type]} posts in last ${windowMinutes} minutes`,
            severity: 'medium',
            confidence: 0.85,
            status: 'active',
            posts: { connect: posts.filter(p => p.type === post.type).map(p => ({ id: p.id })) },
          },
        });
        const io = getIo();
        io.emit('newAlert', alert);
      }
    }
  }
}

module.exports = { generateAlerts };