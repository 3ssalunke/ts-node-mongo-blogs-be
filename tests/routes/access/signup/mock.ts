import { Types } from "mongoose";
import bcrypt from "bcrypt";
import KeyStore from "../../../../src/database/model/KeyStore";
import User from "../../../../src/database/model/User";
import { mockUserFindByEmail } from "../login/mock";

export const USER_NAME = "randomname";
export const USER_PROFILE_PIC = "randomname.profilepictest.com";

export const bcryptHashSpy = jest.spyOn(bcrypt, "hash");

export const mockUserCreate = jest.fn(
  async (user: User): Promise<{ user: User; keystore: KeyStore }> => {
    user._id = new Types.ObjectId();
    user.roles = [];

    return {
      user: user,
      keystore: {
        _id: new Types.ObjectId(),
        client: user,
        primaryKey: "accesstoken",
        secondaryKey: "refreshtoken",
      },
    };
  }
);

jest.mock("../../../../src/database/repository/UserRepo", () => ({
  findByEmail: mockUserFindByEmail,
  create: mockUserCreate,
}));
