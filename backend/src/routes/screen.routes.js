import { Router } from "express";
import { addScreen, deleteScreen, getScreensForMovie } from "../controllers/screen.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)
router.use(isAdmin)
  
router.route("/:movieId").post(addScreen);

router.route("/:screenId").delete(deleteScreen);

router.route("/:movieId").get(getScreensForMovie);

export default router;