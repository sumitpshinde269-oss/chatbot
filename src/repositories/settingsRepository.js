const prisma = require('../config/database');

async function getByUserId(userId) {
  return prisma.userSetting.findUnique({ where: { userId } });
}

async function upsert(userId, data) {
  return prisma.userSetting.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data },
  });
}

module.exports = { getByUserId, upsert };