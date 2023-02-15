import { Router } from "express";

import writer from "./writer";
import editor from "./editor";
import validator, { ValidationSource } from "../../helpers/validator";
import schema from "./schema";
import asyncHandler from "../../helpers/asyncHandler";
import BlogRepo from "../../database/repository/BlogRepo";
import BlogCache from "../../cache/repository/BlogCache";
import { SuccessResponse } from "../../core/ApiResponse";
import { NotFoundError } from "../../core/ApiError";
import { KeyTypeBase } from "../../cache/keys";
import { Types } from "mongoose";

const router = Router();

router.use("/writer", writer);
router.use("/editor", editor);

router.get(
  "/url",
  validator(schema.blogUrl, ValidationSource.QUERY),
  asyncHandler(async (req, res) => {
    const blogUrl = req.query.endpoint as string;

    let blog = await BlogCache.fetchByUrl(blogUrl);

    if (!blog) {
      blog = await BlogRepo.findPublishedByUrl(blogUrl);
      if (blog) await BlogCache.save(blog, KeyTypeBase.URL);
    }

    if (!blog) throw new NotFoundError("Blog not found");

    return new SuccessResponse("success", blog).send(res);
  })
);

router.get(
  "/id/:id",
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req, res) => {
    const blogId = new Types.ObjectId(req.params.id);
    let blog = await BlogCache.fetchById(blogId);

    if (!blog) {
      blog = await BlogRepo.findInfoForPublishedById(blogId);
      if (blog) await BlogCache.save(blog, KeyTypeBase.ID);
    }

    if (!blog) throw new NotFoundError("Blog not found");

    return new SuccessResponse("success", blog).send(res);
  })
);

export default router;
