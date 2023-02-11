import { Router } from "express";
import crypto from "crypto";
import authentication from "../../auth/authentication";
import { createTokens, validateTokenData } from "../../auth/authUtils";
import { AuthFailureError } from "../../core/ApiError";
import JWT from "../../core/JWT";
import KeyStoreRepo from "../../database/repository/KeyStoreRepo";
import asyncHandler from "../../helpers/asyncHandler";
import validator, { ValidationSource } from "../../helpers/validator";
import { ProtectedRequest } from "../../types/app-request";
import schema from "./schema";
import { TokenRefreshResponse } from "../../core/ApiResponse";

const router = Router();

router.use(authentication);

router.post(
  "/refresh",
  validator(schema.auth, ValidationSource.HEADERS),
  validator(schema.refreshToken),
  asyncHandler(async (req: ProtectedRequest, res, next) => {
    const accessTokenPayload = await JWT.validate(req.accessToken);
    validateTokenData(accessTokenPayload);

    const refreshTokenPayload = await JWT.validate(req.body.refreshToken);
    validateTokenData(refreshTokenPayload);

    if (accessTokenPayload.sub !== refreshTokenPayload.sub)
      throw new AuthFailureError("Invalid access token");

    const keystore = await KeyStoreRepo.find(
      req.user,
      accessTokenPayload.prm,
      refreshTokenPayload.prm
    );
    if (!keystore) throw new AuthFailureError("Invalid access token");
    await KeyStoreRepo.remove(keystore._id);

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await KeyStoreRepo.create(req.user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(
      req.user,
      accessTokenKey,
      refreshTokenKey
    );

    new TokenRefreshResponse(
      "Token Issued",
      tokens.accessToken,
      tokens.refreshToken
    ).send(res);
  })
);

export default router;
