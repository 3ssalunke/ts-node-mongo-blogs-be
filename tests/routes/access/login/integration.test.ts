jest.resetAllMocks();

import bcrypt from "bcrypt";
import { Types } from "mongoose";
import supertest from "supertest";

import * as authUtils from "../../../../src/auth/authUtils";
import app from "../../../../src/app";
import { connection } from "../../../../src/database";
import ApiKey, { ApiKeyModel } from "../../../../src/database/model/ApiKey";
import { RoleCode } from "../../../../src/database/model/Role";
import User, { UserModel } from "../../../../src/database/model/User";
import UserRepo from "../../../../src/database/repository/UserRepo";
import KeyStoreRepo from "../../../../src/database/repository/KeyStoreRepo";

const userFindByEmailSpy = jest.spyOn(UserRepo, "findByEmail");
const bcryptCompareSpy = jest.spyOn(bcrypt, "compare");
const createTokensSpy = jest.spyOn(authUtils, "createTokens");
const keystoreCreateSpy = jest.spyOn(KeyStoreRepo, "create");

describe("Login basic route", () => {
  const endpoint = "/login/basic";
  const request = supertest(app);
  const password = "jhal123456";

  let user: User;
  let apikey: ApiKey | null;

  beforeAll(async () => {
    await UserModel.deleteMany({});
    user = await UserModel.create({
      name: "jim harper",
      email: "jharper@dmpaper.com",
      password: bcrypt.hashSync(password, 10),
      status: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      profilePicUrl: "https://dmpaper.com/profie-pic/jimhar",
      roles: [{ _id: new Types.ObjectId(), code: RoleCode.LEARNER }],
    });
    apikey = await ApiKeyModel.findOne({ status: true });
  });

  afterAll(async () => {
    await UserModel.deleteMany({});
    connection.close();
  });

  beforeEach(() => {
    userFindByEmailSpy.mockClear();
    bcryptCompareSpy.mockClear();
    createTokensSpy.mockClear();
    keystoreCreateSpy.mockClear();
  });

  it("should send error when empty body is sent", async () => {
    const response = await addHeaders(request.post(endpoint), apikey);
    expect(response.status).toBe(400);
    expect(userFindByEmailSpy).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send an error when only email is sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: "jharper@dmpaper.com" }),
      apikey
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password/);
    expect(userFindByEmailSpy).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send an error when only password is sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ password }),
      apikey
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/);
    expect(userFindByEmailSpy).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send an error when email is not in valid format", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: "jharper.dmpaper.com", password }),
      apikey
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/valid email/);
    expect(userFindByEmailSpy).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send an error when email is not in valid format", async () => {
    const response = await addHeaders(
      request
        .post(endpoint)
        .send({ email: "jharper@dmpaper.com", password: "123" }),
      apikey
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password length/);
    expect(response.body.message).toMatch(/6 char/);
    expect(userFindByEmailSpy).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send an error when email is not registered", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: "jimharper@dmpaper.com", password }),
      apikey
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/not registered/);
    expect(userFindByEmailSpy).toBeCalledTimes(1);
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send an error for wrong password", async () => {
    const response = await addHeaders(
      request
        .post(endpoint)
        .send({ email: "jharper@dmpaper.com", password: "123456" }),
      apikey
    );
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication failure/i);
    expect(userFindByEmailSpy).toBeCalledTimes(1);
    expect(bcryptCompareSpy).toBeCalledTimes(1);
    expect(createTokensSpy).not.toBeCalled();
    expect(keystoreCreateSpy).not.toBeCalled();
  });

  it("should send success response for correct credentials", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: "jharper@dmpaper.com", password }),
      apikey
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Success/i);
    expect(response.body.data).toBeDefined();

    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user).toHaveProperty("_id");
    expect(response.body.data.user).toHaveProperty("name");
    expect(response.body.data.user).toHaveProperty("roles");
    expect(response.body.data.user).toHaveProperty("profilePicUrl");

    expect(response.body.data.tokens).toBeDefined();
    expect(response.body.data.tokens).toHaveProperty("accessToken");
    expect(response.body.data.tokens).toHaveProperty("refreshToken");

    expect(userFindByEmailSpy).toBeCalledTimes(1);
    expect(bcryptCompareSpy).toBeCalledTimes(1);
    expect(keystoreCreateSpy).toBeCalledTimes(1);
    expect(createTokensSpy).toBeCalledTimes(1);
  });
});

export const addHeaders = (request: any, apikey: ApiKey | null) =>
  request.set("Content-Type", "application/json").set("x-api-key", apikey?.key);
