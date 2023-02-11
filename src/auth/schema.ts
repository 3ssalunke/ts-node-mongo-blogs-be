import Joi from "joi";
import { Header } from "../core/utils";
import { JoiAuthBearer } from "../helpers/validator";

export default {
  apikey: Joi.object()
    .keys({
      [Header.API_KEY]: Joi.string().required(),
    })
    .unknown(true),
  auth: Joi.object()
    .keys({
      [Header.AUTHORIZATION]: JoiAuthBearer().required(),
    })
    .unknown(true),
};
