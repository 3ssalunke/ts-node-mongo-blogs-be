import Role, { RoleCode, RoleModel } from "../model/Role";

async function findByCodes(codes: string[]): Promise<Role[]> {
  return RoleModel.find({ code: { $in: codes }, status: true })
    .lean()
    .exec();
}

export default {
  findByCodes,
};
