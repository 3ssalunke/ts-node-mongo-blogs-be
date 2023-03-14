import { Types } from "mongoose";
import Blog from "../../../../src/database/model/Blog";
import { KeyTypeBase } from "../../../../src/cache/keys";

export const BLOG_ID_1 = new Types.ObjectId();
export const BLOG_ID_2 = new Types.ObjectId();

export const BLOG_URL_1 = "a://abc";
export const BLOG_URL_2 = "a://cba";

export const mockBlogCacheFetchByUrl = jest.fn(
  async (blogUrl: string): Promise<Blog | null> => {
    if (blogUrl === BLOG_URL_1) {
      return {
        _id: BLOG_ID_1,
        blogUrl: BLOG_URL_1,
      } as Blog;
    }
    return null;
  }
);

export const mockBlogCacheFetchById = jest.fn(
  async (blogId: Types.ObjectId): Promise<Blog | null> => {
    if (BLOG_ID_1.equals(blogId)) {
      return {
        _id: BLOG_ID_1,
        blogUrl: BLOG_URL_1,
      } as Blog;
    }
    return null;
  }
);

export const mockBlogCacheSave = jest.fn(
  async (blog: Blog, keyBase: KeyTypeBase): Promise<string> => {
    return JSON.stringify(blog);
  }
);

export const mockFindPublishedByUrl = jest.fn(
  async (blogUrl: string): Promise<Blog | null> => {
    if (blogUrl === BLOG_URL_1) {
      return {
        _id: BLOG_ID_1,
        blogUrl: BLOG_URL_1,
      } as Blog;
    }
    if (blogUrl === BLOG_URL_2) {
      return {
        _id: BLOG_ID_2,
        blogUrl: BLOG_URL_2,
      } as Blog;
    }
    return null;
  }
);

jest.mock("../../../../src/cache/repository/BlogCache", () => ({
  save: mockBlogCacheSave,
  fetchByUrl: mockBlogCacheFetchByUrl,
}));

jest.mock("../../../../src/database/repository/BlogRepo", () => ({
  findPublishedByUrl: mockFindPublishedByUrl,
}));
