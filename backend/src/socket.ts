import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

function buildAllowedOrigins(): string[] {
  const defaults = [
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:3003",
  ];
  const fromEnv =
    process.env.CORS_ORIGINS?.split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0) ?? [];
  return [...new Set([...defaults, ...fromEnv])];
}

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
