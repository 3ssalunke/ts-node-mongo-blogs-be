import { Types } from "mongoose";
import bcrypt from "bcrypt";
import KeyStore from "../../../../src/database/model/KeyStore";
import User from "../../../../src/database/model/User";
import * as authUtils from "../../../../src/auth/authUtils";
import { USER_NAME, USER_PROFILE_PIC } from "../signup/mock";

export const USER_EMAIL = "random@test.com";
export const USER_ID = new Types.ObjectId();
export const USER_PASSWORD = "abc12345";
export const USER_PASSWORD_HASH = bcrypt.hashSync(USER_PASSWORD, 10);

export const createTokensSpy = jest.spyOn(authUtils, "createTokens");
export const bcryptCompareSpy = jest.spyOn(bcrypt, "compare");

export const mockKeystoreCreate = jest.fn(
  async (
    client: User,
    primaryKey: string,
    secondaryKey: string
  ): Promise<KeyStore> => {
    return {
      _id: new Types.ObjectId(),
      client,
      primaryKey,
      secondaryKey,
    };
  }
);

export const mockUserFindByEmail = jest.fn(
  async (email: string): Promise<User | null> => {
    if (email === USER_EMAIL) {
      return {
        _id: USER_ID,
        email: USER_EMAIL,
        password: USER_PASSWORD_HASH,
        name: USER_NAME,
        profilePicUrl: USER_PROFILE_PIC,
        roles: [],
      };
    }
    return null;
  }
);

jest.mock("../../../../src/database/repository/KeyStoreRepo", () => ({
  create: mockKeystoreCreate,
}));

jest.mock("../../../../src/database/repository/UserRepo", () => ({
  findByEmail: mockUserFindByEmail,
}));

jest.unmock("../../../../src/auth/authUtils");
