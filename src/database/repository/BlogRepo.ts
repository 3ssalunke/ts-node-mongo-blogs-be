import { Types } from "mongoose";
import Blog, { BlogModel } from "../model/Blog";
import User from "../model/User";

const AUTHOR_DETAIL = "+name +profilePicUrl";

async function create(blog: Blog): Promise<Blog | null> {
  const now = new Date();
  blog.createdAt = now;
  blog.updatedAt = now;

  const createdBlog = await BlogModel.create(blog);
  return createdBlog.toObject();
}

async function update(blog: Blog): Promise<Blog | null> {
  const now = new Date();
  blog.updatedAt = now;

  return BlogModel.findByIdAndUpdate(blog._id, blog, { new: true })
    .lean()
    .exec();
}

async function findAllPublishedForAuthor(user: User): Promise<Blog[]> {
  return BlogModel.find({ author: user, status: true, isPublished: true })
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findAllSubmitted(): Promise<Blog[]> {
  return findDetailedBlogs({ status: true, isSubmitted: true });
}

async function findAllPublished(): Promise<Blog[]> {
  return findDetailedBlogs({ status: true, isPublished: true });
}

async function findAllDrafts(): Promise<Blog[]> {
  return findDetailedBlogs({ status: true, isDraft: true });
}

async function findAllSubmittedForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({ author: user, status: true, isSubmitted: true });
}

async function findAllPublishedForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({ author: user, status: true, isPublished: true });
}

async function findAllDraftsForWriter(user: User): Promise<Blog[]> {
  return findDetailedBlogs({ author: user, status: true, isDraft: true });
}

async function findBlogAllDataById(id: Types.ObjectId): Promise<Blog | null> {
  return BlogModel.findOne({ _id: id, status: true })
    .select(
      "+text +draftText +isSubmitted +isDraft +isPublished +status +createdBy +updatedBy"
    )
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findInfoForPublishedById(
  blogId: Types.ObjectId
): Promise<Blog | null> {
  return BlogModel.findOne({ _id: blogId, isPublished: true, status: true })
    .select("+text")
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findPublishedByUrl(blogUrl: string): Promise<Blog | null> {
  return BlogModel.findOne({
    blogUrl,
    isPublished: true,
    status: true,
  })
    .select("+text")
    .populate("author", AUTHOR_DETAIL)
    .lean()
    .exec();
}

async function findUrlIfExists(blogUrl: string): Promise<Blog | null> {
  return BlogModel.findOne({ blogUrl }).lean().exec();
}

async function findDetailedBlogs(
  query: Record<string, unknown>
): Promise<Blog[]> {
  return BlogModel.find(query)
    .select("+isSubmitted +isDraft +isPublished +createdBy +updatedBy")
    .populate("author", AUTHOR_DETAIL)
    .populate("createdBy", AUTHOR_DETAIL)
    .populate("updatedBy", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findByTagAndPaginated(
  tag: string,
  pageNumber: number,
  limit: number
): Promise<Blog[]> {
  return BlogModel.find({ tags: tag, status: true, isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function findLatestBlogs(
  pageNumber: number,
  limit: number
): Promise<Blog[]> {
  return BlogModel.find({ status: true, isPublished: true })
    .skip(limit * (pageNumber - 1))
    .limit(limit)
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .lean()
    .exec();
}

async function searchSimilarBlogs(blog: Blog, limit: number): Promise<Blog[]> {
  return BlogModel.find(
    {
      $text: { $search: blog.title, $caseSensitive: false },
      status: true,
      isPublished: true,
      _id: { $ne: blog._id },
    },
    {
      similarity: { $meta: "textScore" },
    }
  )
    .populate("author", AUTHOR_DETAIL)
    .sort({ updatedAt: -1 })
    .limit(limit)
    .sort({ similarity: { $meta: "textScore" } })
    .lean()
    .exec();
}

export default {
  create,
  update,
  findAllDrafts,
  findAllPublished,
  findAllSubmitted,
  findAllPublishedForAuthor,
  findAllDraftsForWriter,
  findAllPublishedForWriter,
  findAllSubmittedForWriter,
  findBlogAllDataById,
  findInfoForPublishedById,
  findPublishedByUrl,
  findUrlIfExists,
  findByTagAndPaginated,
  findLatestBlogs,
  searchSimilarBlogs,
};
