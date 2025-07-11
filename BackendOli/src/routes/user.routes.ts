import {Router} from 'express';
import { login, register, getAll, userId } from "../controllers/user.controllers";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/users", getAll);
router.get("/users/:userId", userId);

export default router;
