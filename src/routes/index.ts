import { Router } from "express";
import apikey from "../auth/apikey";
import { Permission } from "../database/model/ApiKey";
import permissions from "../helpers/permissions";
import login from "./access/login";
import logout from "./access/logout";
import signup from "./access/signup";
import token from "./access/token";
import profile from "./profile";
import blog from "./blog";
import blogs from "./blogs";

const router = Router();

router.use(apikey);
router.use(permissions(Permission.GENERAL));

router.get("/api-status", (_, res) => {
  res.json({ message: "service is up!" });
});
router.use("/login", login);
router.use("/logout", logout);
router.use("/signup", signup);
router.use("/token", token);
router.use("/profile", profile);
router.use("/blog", blog);
router.use("/blogs", blogs);

export default router;
