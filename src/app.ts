import express, {
  json,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import cors from "cors";
import { corsURL, environment } from "./config";
import routes from "./routes";
import "./database";
import {
  ApiError,
  ErrorType,
  InternalError,
  NotFoundError,
} from "./core/ApiError";
import Logger from "./core/Logger";

const app = express();

app.use(json({ limit: "10mb" }));
app.use(urlencoded({ limit: "10mb", extended: true, parameterLimit: 5000 }));
app.use(cors({ origin: corsURL, optionsSuccessStatus: 200 }));

app.use("/", routes);

app.use((req, res, next) => next(new NotFoundError()));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ApiError) {
    ApiError.handle(err, res);
    if (err.type === ErrorType.INTERNAL) {
      Logger.error(
        `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
      );
    }
  } else {
    Logger.error(
      `500 - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
    );
    Logger.error(err);
    if (environment === "development") {
      return res.status(500).send(err);
    }
    ApiError.handle(new InternalError(), res);
  }
});

export default app;
