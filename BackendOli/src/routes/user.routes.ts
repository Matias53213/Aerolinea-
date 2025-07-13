import { Router } from "express";
import {
  getAll,
  login,
  register,
  userId,
  updateUser,
  deleteUser
} from "../controllers/user.controllers";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/usuarios", getAll);
router.get("/usuarios/:userId", userId);
router.put("/usuarios/:userId", updateUser);
router.delete("/usuarios/:userId", deleteUser);

export default router;
