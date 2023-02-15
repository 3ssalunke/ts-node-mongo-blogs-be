import { Router } from "express";
import { Types } from "mongoose";
import authentication from "../../auth/authentication";
import authorization from "../../auth/authorization";
import { BadRequestError, ForbiddenError } from "../../core/ApiError";
import { SuccessMsgResponse, SuccessResponse } from "../../core/ApiResponse";
import { RoleCode } from "../../database/model/Role";
import BlogRepo from "../../database/repository/BlogRepo";
import asyncHandler from "../../helpers/asyncHandler";
import role from "../../helpers/role";
import validator, { ValidationSource } from "../../helpers/validator";
import { ProtectedRequest } from "../../types/app-request";
import schema from "./schema";

const router = Router();

router.use(
  authentication,
  role(RoleCode.ADMIN, RoleCode.EDITOR),
  authorization
);

router.put(
  "/publish/:id",
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(
      new Types.ObjectId(req.params.id)
    );
    if (!blog) throw new BadRequestError("Blog does not exist");

    blog.isDraft = false;
    blog.isSubmitted = false;
    blog.isPublished = true;
    blog.text = blog.draftText;

    if (!blog.publishedAt) blog.publishedAt = new Date();
    await BlogRepo.update(blog);
    return new SuccessMsgResponse("Blog published successfully").send(res);
  })
);

router.put(
  "/unpublish/:id",
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(
      new Types.ObjectId(req.params.id)
    );
    if (!blog) throw new BadRequestError("Blog does not exist");

    blog.isDraft = true;
    blog.isSubmitted = false;
    blog.isPublished = false;

    if (!blog.publishedAt) blog.publishedAt = new Date();
    await BlogRepo.update(blog);
    return new SuccessMsgResponse("Blog unpublished successfully").send(res);
  })
);

router.put(
  "/id/:id",
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(
      new Types.ObjectId(req.params.id)
    );
    if (!blog) throw new BadRequestError("Blog does not exist");

    blog.status = false;

    await BlogRepo.update(blog);
    return new SuccessMsgResponse("Blog deleted successfully").send(res);
  })
);

router.get(
  "/drafts/all",
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllDrafts();
    return new SuccessResponse("success", blogs).send(res);
  })
);

router.get(
  "/submitted/all",
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllSubmitted();
    return new SuccessResponse("success", blogs).send(res);
  })
);

router.get(
  "/published/all",
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blogs = await BlogRepo.findAllPublished();
    return new SuccessResponse("success", blogs).send(res);
  })
);

router.get(
  "/id/:id",
  validator(schema.blogId, ValidationSource.PARAM),
  asyncHandler(async (req: ProtectedRequest, res) => {
    const blog = await BlogRepo.findBlogAllDataById(
      new Types.ObjectId(req.params.id)
    );
    if (!blog) throw new BadRequestError("Blog does not exist");

    if (!blog.isSubmitted && !blog.isPublished) {
      throw new ForbiddenError("This blog is private");
    }

    new SuccessResponse("success", blog).send(res);
  })
);

export default router;
