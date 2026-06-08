import express, { Application, Response} from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from 'cookie-parser';
import './config/passport.config';
import { router } from "./routes";
import { globalErrorHandler } from "./middlewares/globalErrorHandler";
import { NotFound } from "./middlewares/NotFound";

const app: Application = express();

app.set('trust proxy', 1);

app.use(cors());

app.use(express.json());
app.use(morgan("combined"));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
// app.use(safeSanitizeMiddleware);

app.use('/api/v1', router);

// Routes
app.get("/", (_, res: Response) => {
  res.json({
    status: "success",
    message: "Welcome to Postwagens Server..............",
  })
});

// NO ROUTE MATCH
app.use(NotFound);

// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

export default app;
