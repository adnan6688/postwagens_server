import { Server } from 'socket.io';
import http from 'http';

let io: Server;
const onlineUsers = new Map<string, string>(); // <userId, socketId>

export const initSocket = (server: http.Server) => {
  io = new Server(server, {
    cors: {
      origin: '*', // Adjust this to your frontend's origin
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', socket => {
    console.log('a user connected', socket.id);

    // Join a room based on userId
    socket.on('join', userId => {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} joined with socket ID ${socket.id}`, onlineUsers.keys());
    });

    socket.on('disconnect', () => {
      console.log('user disconnected', socket.id);
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          onlineUsers.delete(userId);
          break;
        }
      }
      io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getSocketIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const isUserOnline = (userId: string) => {
    return onlineUsers.has(userId);
};
