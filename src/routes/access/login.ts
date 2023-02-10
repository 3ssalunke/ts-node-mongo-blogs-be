import { Router } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import asyncHandler from "../../helpers/asyncHandler";
import { PublicRequest } from "../../types/app-request";
import validator from "../../helpers/validator";
import schema from "./schema";
import UserRepo from "../../database/repository/UserRepo";
import { AuthFailureError, BadRequestError } from "../../core/ApiError";
import KeyStoreRepo from "../../database/repository/KeyStoreRepo";
import { createTokens } from "../../auth/authUtils";
import { getUserData } from "./utils";
import { SuccessResponse } from "../../core/ApiResponse";

const router = Router();

router.post(
  "/basic",
  validator(schema.credential),
  asyncHandler(async (req: PublicRequest, res) => {
    const user = await UserRepo.findByEmail(req.body.email);
    if (!user) throw new BadRequestError("User not registered");
    if (!user.password) throw new BadRequestError("Credentials not set");

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) throw new AuthFailureError("Authentication failure");

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");

    await KeyStoreRepo.create(user, accessTokenKey, refreshTokenKey);
    const tokens = await createTokens(user, accessTokenKey, refreshTokenKey);
    const userData = await getUserData(user);
    new SuccessResponse("Login Success", {
      user: userData,
      tokens,
    }).send(res);
  })
);

export default router;
