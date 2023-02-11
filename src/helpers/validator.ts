import { BadRequestError } from "../core/ApiError";
import Logger from "../core/Logger";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export enum ValidationSource {
  BODY = "body",
  HEADERS = "headers",
  QUERY = "query",
  PARAM = "params",
}

export const JoiAuthBearer = () =>
  Joi.string().custom((value: string, helpers) => {
    if (!value.startsWith("Bearer ")) return helpers.error("any.invalid");
    if (!value.split(" ")[1]) return helpers.error("any.invalid");
    return value;
  }, "Authorization header validation");

export default (
    schema: Joi.AnySchema,
    source: ValidationSource = ValidationSource.BODY
  ) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { error } = schema.validate(req[source]);
      if (!error) return next();

      const { details } = error;
      const message = details
        .map((i) => i.message.replace(/['"]+/g, ""))
        .join(",");

      Logger.error(message);

      next(new BadRequestError(message));
    } catch (error) {
      next(error);
    }
  };
