import bcrypt from "bcrypt";
import crypto from "crypto";
import validator from "../../helpers/validator";
import { Router } from "express";
import schema from "./schema";
import asyncHandler from "../../helpers/asyncHandler";
import { RoleRequest } from "../../types/app-request";
import UserRepo from "../../database/repository/UserRepo";
import { BadRequestError } from "../../core/ApiError";
import { RoleCode } from "../../database/model/Role";
import User from "../../database/model/User";
import { createTokens } from "../../auth/authUtils";
import { SuccessResponse } from "../../core/ApiResponse";
import { getUserData } from "./utils";

const router = Router();

router.post(
  "/basic",
  validator(schema.signup),
  asyncHandler(async (req: RoleRequest, res, next) => {
    const user = await UserRepo.findByEmail(req.body.email);
    if (user) throw new BadRequestError("User already registered");

    const accessTokenKey = crypto.randomBytes(64).toString("hex");
    const refreshTokenKey = crypto.randomBytes(64).toString("hex");
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    const { user: createdUser, keystore } = await UserRepo.create(
      {
        name: req.body.name,
        email: req.body.email,
        profilePicUrl: req.body.profilePicUrl,
        password: passwordHash,
      } as User,
      accessTokenKey,
      refreshTokenKey,
      RoleCode.LEARNER
    );

    const tokens = await createTokens(
      createdUser,
      keystore.primaryKey,
      keystore.secondaryKey
    );
    const userData = await getUserData(createdUser);
    console.log(userData);
    new SuccessResponse("Signup Successfull", {
      user: userData,
      tokens,
    }).send(res);
  })
);

export default router;
