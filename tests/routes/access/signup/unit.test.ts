import "../../../database/mock";
import "../../../auth/apikey/mock";
import { addHeaders } from "../../../auth/authentication/mock";
import {
  bcryptCompareSpy,
  createTokensSpy,
  mockKeystoreCreate,
  mockUserFindByEmail,
  USER_EMAIL,
  USER_PASSWORD,
} from "../login/mock";
import {
  bcryptHashSpy,
  mockUserCreate,
  USER_NAME,
  USER_PROFILE_PIC,
} from "./mock";

import supertest from "supertest";
import app from "../../../../src/app";

describe("Signup basic route", () => {
  const endpoint = "/signup/basic";
  const request = supertest(app);

  const email = "abc@test.com";

  beforeEach(() => {
    mockUserFindByEmail.mockClear();
    mockKeystoreCreate.mockClear();
    bcryptCompareSpy.mockClear();
    createTokensSpy.mockClear();
  });

  it("should send error when empty body is sent", async () => {
    const response = await addHeaders(request.post(endpoint));
    expect(response.status).toBe(400);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when email is not sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        name: USER_NAME,
        password: USER_PASSWORD,
        profilePicUrl: USER_PROFILE_PIC,
      })
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/);
    expect(response.body.message).toMatch(/required/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when password is not sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        name: USER_NAME,
        email: email,
        profilePicUrl: USER_PROFILE_PIC,
      })
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password/);
    expect(response.body.message).toMatch(/required/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when name is not sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        email: email,
        password: USER_PASSWORD,
        profilePicUrl: USER_PROFILE_PIC,
      })
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/name/);
    expect(response.body.message).toMatch(/required/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when email is not valid format", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        email: "email",
        password: USER_PASSWORD,
        name: USER_NAME,
        profilePicUrl: USER_PROFILE_PIC,
      })
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/valid email/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when password is not valid format", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        email: email,
        password: "123",
        name: USER_NAME,
        profilePicUrl: USER_PROFILE_PIC,
      })
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password length/);
    expect(response.body.message).toMatch(/6 char/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when user is already registered for email", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        email: USER_EMAIL,
        password: USER_PASSWORD,
        name: USER_NAME,
      })
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/already registered/);
    expect(mockUserFindByEmail).toBeCalledTimes(1);
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send success response for correct data", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({
        email: email,
        password: USER_PASSWORD,
        name: USER_NAME,
      })
    );

    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/Success/i);
    expect(response.body.data).toBeDefined();

    expect(response.body.data.user).toBeDefined();
    expect(response.body.data.user).toHaveProperty("_id");
    expect(response.body.data.user).toHaveProperty("name");
    expect(response.body.data.user).toHaveProperty("roles");

    expect(response.body.data.tokens).toBeDefined();
    expect(response.body.data.tokens).toHaveProperty("accessToken");
    expect(response.body.data.tokens).toHaveProperty("refreshToken");

    expect(mockUserFindByEmail).toBeCalledTimes(1);
    expect(bcryptHashSpy).toBeCalledTimes(1);
    expect(mockUserCreate).toBeCalledTimes(1);
    expect(createTokensSpy).toBeCalledTimes(1);

    expect(bcryptHashSpy).toBeCalledWith(USER_PASSWORD, 10);
  });
});
