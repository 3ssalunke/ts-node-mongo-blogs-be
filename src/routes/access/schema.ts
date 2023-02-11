import Joi from "joi";
import { JoiAuthBearer } from "../../helpers/validator";

export default {
  auth: Joi.object()
    .keys({
      authorization: JoiAuthBearer().required(),
    })
    .unknown(true),
  credential: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
  }),
  refreshToken: Joi.object().keys({
    refreshToken: Joi.string().required().min(1),
  }),
  signup: Joi.object().keys({
    name: Joi.string().required().min(3),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(6),
    profilePicUrl: Joi.string().optional().uri(),
  }),
};
