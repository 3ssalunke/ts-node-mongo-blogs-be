import { Types } from "mongoose";
import KeyStore, { KeyStoreModel } from "../model/KeyStore";
import User from "../model/User";

async function findForKey(
  client: User,
  primaryKey: string
): Promise<KeyStore | null> {
  return KeyStoreModel.findOne({
    client,
    primaryKey,
    status: true,
  })
    .lean()
    .exec();
}

async function create(
  client: User,
  primaryKey: string,
  secondaryKey: string
): Promise<KeyStore> {
  const now = new Date();
  const keystore = await KeyStoreModel.create({
    client,
    primaryKey,
    secondaryKey,
    createdAt: now,
    updatedAt: now,
  });
  return keystore.toObject();
}

async function remove(id: Types.ObjectId): Promise<KeyStore | null> {
  return KeyStoreModel.findByIdAndDelete(id).lean().exec();
}

async function find(
  client: User,
  primaryKey: string,
  secondaryKey: string
): Promise<KeyStore | null> {
  return KeyStoreModel.findOne({
    client,
    primaryKey,
    secondaryKey,
  })
    .lean()
    .exec();
}

export default {
  create,
  find,
  findForKey,
  remove,
};
