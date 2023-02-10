import { Date, model, Schema, Types } from "mongoose";
import User from "./User";

export const DOCUMENT_NAME = "KeyStore";
export const COLLECTION_NAME = "keystores";

export default interface KeyStore {
  _id: Types.ObjectId;
  client: User;
  primaryKey: string;
  secondaryKey: string;
  status?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const schema = new Schema<KeyStore>(
  {
    client: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    primaryKey: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    secondaryKey: {
      type: Schema.Types.String,
      required: true,
      trim: true,
    },
    status: {
      type: Schema.Types.Boolean,
      default: true,
    },
    createdAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
    updatedAt: {
      type: Schema.Types.Date,
      required: true,
      select: false,
    },
  },
  {
    versionKey: false,
  }
);

schema.index({ client: 1 });
schema.index({ client: 1, primaryKey: 1, status: 1 });
schema.index({ client: 1, primaryKey: 1, secondaryKey: 1 });

export const KeyStoreModel = model<KeyStore>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);
