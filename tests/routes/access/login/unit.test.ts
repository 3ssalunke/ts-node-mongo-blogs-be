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
} from "./mock";

import supertest from "supertest";
import app from "../../../../src/app";

describe("Login basic route", () => {
  const endpoint = "/login/basic";
  const request = supertest(app);

  beforeEach(() => {
    mockKeystoreCreate.mockClear();
    mockUserFindByEmail.mockClear();
    createTokensSpy.mockClear();
    bcryptCompareSpy.mockClear();
  });

  it("should send error when empty body is sent", async () => {
    const response = await addHeaders(request.post(endpoint));
    expect(response.status).toBe(400);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when only email is sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: USER_EMAIL })
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when only password is sent", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ password: USER_PASSWORD })
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/email/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when email is not valid format", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: "123" })
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
      request.post(endpoint).send({ email: "123@abc.com", password: "123" })
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/password length/);
    expect(response.body.message).toMatch(/6 char/);
    expect(mockUserFindByEmail).not.toBeCalled();
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error when user is not registered for email", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: "123@abc.com", password: "123467" })
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/not registered/);
    expect(mockUserFindByEmail).toBeCalledTimes(1);
    expect(bcryptCompareSpy).not.toBeCalled();
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send error for wrong password", async () => {
    const response = await addHeaders(
      request.post(endpoint).send({ email: USER_EMAIL, password: "123467" })
    );
    expect(response.status).toBe(401);
    expect(response.body.message).toMatch(/authentication failure/i);
    expect(mockUserFindByEmail).toBeCalledTimes(1);
    expect(bcryptCompareSpy).toBeCalledTimes(1);
    expect(mockKeystoreCreate).not.toBeCalled();
    expect(createTokensSpy).not.toBeCalled();
  });

  it("should send success response for correct credentials", async () => {
    const response = await addHeaders(
      request
        .post(endpoint)
        .send({ email: USER_EMAIL, password: USER_PASSWORD })
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

    expect(mockUserFindByEmail).toBeCalledTimes(1);
    expect(bcryptCompareSpy).toBeCalledTimes(1);
    expect(mockKeystoreCreate).toBeCalledTimes(1);
    expect(createTokensSpy).toBeCalledTimes(1);
  });
});
