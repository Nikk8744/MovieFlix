import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { addMovie, getAllMovies, getMovieById, getMoviesByQuery, updateMovie } from "../controllers/movie.controller.js";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT)
// dont know if isAdmin should be use as global or in specific routes
// router.use(isAdmin) 

router.route("/upload-movie").post(
    isAdmin, 
    upload.single("posterImgUrl"),
    addMovie
);

router.route("/getAllMovies").get(getAllMovies);
// here you need to write getAllMovies route before getMovieByID route or else it will throw invalid movie id error

router.route("/:movieId").get(getMovieById);

router.route("/:movieId").patch(isAdmin, upload.single("posterImgUrl"), updateMovie);

router.route("/getMovieByQuery").get(getMoviesByQuery)


export default router;