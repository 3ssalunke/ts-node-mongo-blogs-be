import { InternalError } from "../../core/ApiError";
import KeyStore from "../model/KeyStore";
import { RoleCode, RoleModel } from "../model/Role";
import User, { UserModel } from "../model/User";
import KeyStoreRepo from "./KeyStoreRepo";

async function findByEmail(email: string): Promise<User | null> {
  return UserModel.findOne({ email })
    .select("+email +password +roles +verified +status +profilePicUrl")
    .populate({
      path: "roles",
      match: { status: true },
      select: { code: 1 },
    })
    .lean()
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

export default {
  findByEmail,
  create,
};
