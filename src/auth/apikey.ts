import { Router } from "express";
import { ForbiddenError } from "../core/ApiError";
import Logger from "../core/Logger";
import { Header } from "../core/utils";
import ApiKeyRepo from "../database/repository/ApiKeyRepo";
import asyncHandler from "../helpers/asyncHandler";
import validator, { ValidationSource } from "../helpers/validator";
import { PublicRequest } from "../types/app-request";
import schema from "./schema";

const router = Router();

export default router.use(
  validator(schema.apikey, ValidationSource.HEADERS),
  asyncHandler(async (req: PublicRequest, res, next) => {
    const key = req.headers[Header.API_KEY]?.toString();
    if (!key) throw new ForbiddenError();

    const apikey = await ApiKeyRepo.findByKey(key);
    if (!apikey) throw new ForbiddenError();
    Logger.info(apikey);

    req.apiKey = apikey;
    return next();
  })
);
