import { Server } from './Server.js';

const server = new Server();

server.start().then(() => {
  console.log('Server started!');
});

process.on('SIGINT', async () => {
  await server.stop();
});
