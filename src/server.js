const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const config = require('./config');

const server = http.createServer(app);
const io = initSocket(server);

server.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => process.exit(0));
});