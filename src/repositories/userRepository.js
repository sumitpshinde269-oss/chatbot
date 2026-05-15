const prisma = require('../config/database');

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function createUser(data) {
  return prisma.user.create({ data });
}

async function findById(id) {
  return prisma.user.findUnique({ where: { id } });
}

module.exports = { findByEmail, createUser, findById };