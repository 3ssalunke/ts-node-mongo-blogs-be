import KeyStore, { KeyStoreModel } from "../model/KeyStore";
import User from "../model/User";

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

export default {
  create,
};
