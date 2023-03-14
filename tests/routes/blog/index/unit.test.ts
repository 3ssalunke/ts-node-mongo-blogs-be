import "../../../database/mock";
import "../../../cache/mock";
import { addHeaders } from "../../../auth/authentication/mock";

import {
  BLOG_URL_1,
  BLOG_URL_2,
  mockBlogCacheFetchByUrl,
  mockBlogCacheSave,
  mockFindPublishedByUrl,
} from "./mock";

import supertest from "supertest";
import app from "../../../../src/app";

describe("Blog detail by URL route", () => {
  const request = supertest(app);
  const endpoint = "/blog/url";

  beforeEach(() => {
    mockBlogCacheFetchByUrl.mockClear();
    mockFindPublishedByUrl.mockClear();
    mockBlogCacheSave.mockClear();
  });

  it("should send error when endpoint query is not passed", async () => {
    const response = await addHeaders(request.get(endpoint));
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/endpoint/);
    expect(response.body.message).toMatch(/required/);
    expect(mockBlogCacheFetchByUrl).not.toBeCalled();
  });

  it("should send error when endpoint query is more than 200 chars long", async () => {
    const urlQueryString = "a://" + new Array(201).fill("a").join("");
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: urlQueryString })
    );
    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/length must/);
    expect(response.body.message).toMatch(/200/);
    expect(mockBlogCacheFetchByUrl).not.toBeCalled();
  });

  it("should send error when blog does not exists for url", async () => {
    const urlQueryString = "a://" + "bbc";
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: urlQueryString })
    );
    expect(response.status).toBe(404);
    expect(response.body.message).toMatch(/not found/);
    expect(mockBlogCacheFetchByUrl).toBeCalledTimes(1);
    expect(mockBlogCacheFetchByUrl).toBeCalledWith(urlQueryString);
    expect(mockBlogCacheSave).not.toBeCalled();
    expect(mockFindPublishedByUrl).toBeCalledTimes(1);
    expect(mockFindPublishedByUrl).toBeCalledWith(urlQueryString);
  });

  it("should send cache data when blog does exist for url in cache", async () => {
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: BLOG_URL_1 })
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty("_id");

    expect(mockBlogCacheFetchByUrl).toBeCalledTimes(1);
    expect(mockBlogCacheFetchByUrl).toBeCalledWith(BLOG_URL_1);
    expect(mockBlogCacheFetchByUrl).toReturnTimes(1);

    expect(mockBlogCacheSave).not.toBeCalled();
    expect(mockFindPublishedByUrl).not.toBeCalled();
  });

  it("should send database data when blog does not exist for url in cache", async () => {
    const response = await addHeaders(
      request.get(endpoint).query({ endpoint: BLOG_URL_2 })
    );
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/success/);
    expect(response.body.data).toBeDefined();
    expect(response.body.data).toHaveProperty("_id");

    expect(mockBlogCacheFetchByUrl).toBeCalledTimes(1);
    expect(mockBlogCacheFetchByUrl).toBeCalledWith(BLOG_URL_2);
    expect(mockBlogCacheFetchByUrl).toReturnTimes(1);

    expect(mockFindPublishedByUrl).toBeCalledTimes(1);
    expect(mockFindPublishedByUrl).toBeCalledWith(BLOG_URL_2);
    expect(mockFindPublishedByUrl).toReturnTimes(1);

    expect(mockBlogCacheSave).toBeCalledTimes(1);
    expect(mockBlogCacheSave).toReturnTimes(1);
  });
});
