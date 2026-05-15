const prisma = require('../config/database');

async function create(data) {
  return prisma.post.create({ data });
}

async function findMany(limit = 50) {
  return prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { user: { select: { name: true, email: true } } },
  });
}

module.exports = { create, findMany };