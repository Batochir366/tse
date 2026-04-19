import { Server } from "socket.io";
import { Server as HttpServer } from "http";
import { buildAllowedOrigins } from "./config/corsOrigins";

let io: Server;

export const initSocket = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: buildAllowedOrigins(),
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("watch-payment", (invoiceId: string) => {
      socket.join(`payment:${invoiceId}`);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};
