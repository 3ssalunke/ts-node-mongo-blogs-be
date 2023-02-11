import Joi from "joi";

export default {
  profile: Joi.object().keys({
    name: Joi.string().min(1).max(200).optional(),
    profilePicUrl: Joi.string().uri().optional(),
  }),
};
