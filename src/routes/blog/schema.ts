import Joi from "joi";
import { JoiObjectId, JoiUrlEndpoint } from "../../helpers/validator";

export default {
  blogId: Joi.object().keys({
    id: JoiObjectId().required(),
  }),
  blogUrl: Joi.object().keys({
    endpoint: JoiUrlEndpoint().required().max(200),
  }),
  blogCreate: Joi.object().keys({
    title: Joi.string().required().min(3).max(500),
    decription: Joi.string().required().min(3).max(2000),
    text: Joi.string().required().max(50000),
    blogUrl: JoiUrlEndpoint().required().max(200),
    imageUrl: Joi.string().optional().uri().max(200),
    score: Joi.number().optional().min(0).max(1),
    tags: Joi.array().optional().min(1).items(Joi.string().uppercase()),
  }),
};
