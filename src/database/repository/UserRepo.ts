import { Types, UpdateQuery } from "mongoose";
import { InternalError } from "../../core/ApiError";
import KeyStore from "../model/KeyStore";
import { RoleCode, RoleModel } from "../model/Role";
import User, { UserModel } from "../model/User";
import KeyStoreRepo from "./KeyStoreRepo";

async function findById(id: Types.ObjectId): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true })
    .select("+name +email password +roles")
    .populate({
      path: "roles",
      match: { status: true },
    })
    .lean()
    .exec();
}

async function findByEmail(email: string): Promise<User | null> {
  return UserModel.findOne({ email })
    .select("+name +email +password +roles +verified +status +profilePicUrl")
    .populate({
      path: "roles",
      match: { status: true },
      select: { code: 1 },
    })
    .lean()
    .exec();
}

async function findPrivateProfileById(
  id: Types.ObjectId
): Promise<User | null> {
  return UserModel.findOne({ _id: id, status: true })
    .select("+email")
    .populate({
      path: "roles",
      match: { status: true },
      select: { code: 1 },
    })
    .lean<User>()
    .exec();
}

async function create(
  user: User,
  accessTokenKey: string,
  refreshTokenKey: string,
  roleCode: RoleCode
): Promise<{ user: User; keystore: KeyStore }> {
  const now = new Date();

  const role = await RoleModel.findOne({ code: roleCode })
    .select("+code")
    .lean()
    .exec();
  if (!role) throw new InternalError("Role must be defined");

  user.roles = [role];
  user.createdAt = user.updatedAt = now;
  const createdUser = await UserModel.create(user);
  const keystore = await KeyStoreRepo.create(
    createdUser,
    accessTokenKey,
    refreshTokenKey
  );

  return {
    user: { ...createdUser.toObject(), roles: user.roles },
    keystore: keystore,
  };
}

async function updateInfo(user: User): Promise<UpdateQuery<User>> {
  user.updatedAt = new Date();
  return UserModel.updateOne({ _id: user._id }, { $set: { ...user } })
    .lean()
    .exec();
}

export default {
  create,
  findById,
  findByEmail,
  findPrivateProfileById,
  updateInfo,
};
