import { Router } from "express";
import login from "./access/login";
import signup from "./access/signup";

const router = Router();

router.get("/api-status", (_, res) => {
  res.json({ message: "service is up!" });
});
router.use("/login", login);
router.use("/signup", signup);

export default router;
