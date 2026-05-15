const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const { connectMongoDB } = require('./config/mongodb');
const config = require('./config');

const server = http.createServer(app);
const io = initSocket(server);

// Connect to MongoDB
connectMongoDB();

server.listen(config.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${config.PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => process.exit(0));
});