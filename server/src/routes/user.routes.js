import { Router } from "express";
import { UserController } from "../controller/user.controller.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();
const userController = new UserController();

router.get("/me", authenticate, userController.getProfile);
router.patch("/me", authenticate, userController.updateProfile);
router.get("/", authenticate, authorize("admin"), userController.getAllUsers);
router.delete("/:id", authenticate, authorize("admin"), userController.deleteUser);

export default router;