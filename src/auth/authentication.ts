import { Router } from "express";
import { TokenExpiredError } from "jsonwebtoken";
import { Types } from "mongoose";
import { AccessTokenError, AuthFailureError } from "../core/ApiError";
import JWT from "../core/JWT";
import KeyStoreRepo from "../database/repository/KeyStoreRepo";
import UserRepo from "../database/repository/UserRepo";
import asyncHandler from "../helpers/asyncHandler";
import validator, { ValidationSource } from "../helpers/validator";
import { ProtectedRequest } from "../types/app-request";
import { getAccessToken, validateTokenData } from "./authUtils";
import schema from "./schema";

const router = Router();

export default router.use(
  validator(schema.auth, ValidationSource.HEADERS),
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    req.accessToken = getAccessToken(req.headers.authorization);

    try {
      const payload = await JWT.validate(req.accessToken);
      validateTokenData(payload);

      const user = await UserRepo.findById(new Types.ObjectId(payload.sub));
      if (!user) throw new AuthFailureError("User not registered");
      req.user = user;

      const keystore = await KeyStoreRepo.findForKey(user, payload.prm);
      if (!keystore) throw new AuthFailureError("Invalid access token");
      req.keystore = keystore;

      return next();
    } catch (e) {
      if (e instanceof TokenExpiredError) throw new AccessTokenError(e.message);
      throw e;
    }
  })
);
