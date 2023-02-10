import Logger from "../core/Logger";
import mongoose, { ConnectOptions } from "mongoose";
import { db } from "../config";

const dbURI = `mongodb://${db.host}:${db.port}/${db.name}`;

const options: ConnectOptions = {
  autoIndex: true,
  minPoolSize: db.minPoolSize,
  maxPoolSize: db.maxPoolSize,
  connectTimeoutMS: 60000,
  socketTimeoutMS: 45000,
};

Logger.debug(dbURI);

function setValidators() {
  this.setOptions({ runValidators: true });
}

mongoose.set("strictQuery", true);

mongoose
  .plugin((schema: any) => {
    schema.pre("findOneAndUpdate", setValidators);
    schema.pre("updateMany", setValidators);
    schema.pre("updateOne", setValidators);
    schema.pre("update", setValidators);
  })
  .connect(dbURI, options)
  .then(() => {
    Logger.info("Mongoose connection done");
  })
  .catch((e) => {
    Logger.info("Mongoose connection error");
    Logger.error(e);
  });

mongoose.connection.on("connected", () => {
  Logger.debug("Mongoose default connection open to " + dbURI);
});

mongoose.connection.on("error", (err) => {
  Logger.debug("Mongoose default connection error " + err);
});

mongoose.connection.on("disconnected", () => {
  Logger.debug("Mongoose default connection disconnected");
});

process.on("SIGINT", () => {
  mongoose.connection.close(() => {
    Logger.info(
      "Mongoose default connection disconnected through app termination"
    );
    process.exit(0);
  });
});

export const connection = mongoose.connection;
