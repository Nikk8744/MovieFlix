import { isValidObjectId } from "mongoose";
import { Movie } from "../models/movie.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const addMovie = asyncHandler(async(req, res) => {
    // to add a movie
    // get all details from frontend
    // validate them
    // then get movie poster img's local path
    // validate them
    // upload them on cloudinary
    // store alll details in db
    // return res

    const  { title, description, genre, director, cast, duration } = req.body;

    if(
        [title, description, genre, director, cast, duration].some((field) => field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }
    // console.log(req.body)

    const posterImgLocalPath = req.file?.path
    // console.log("Img path :",req.file)
    if (!posterImgLocalPath) {
        throw new ApiError(400, "Movie Image is required")
    }

    const movieImage = await uploadOnCloudinary(posterImgLocalPath);
    if (!movieImage) {
        throw new ApiError(400, "Movie Img upload failed!!")
    }

    const movie = await Movie.create({
        title, 
        description,
        posterImgUrl: movieImage.url,
        genre,
        director,
        cast,
        duration,
    })

    if (!movie) {
        throw new ApiError(400, "Something went wrong while uploading movie on db")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, movie, "Movie uploaded successfully")
    )
});

const getMovieById = asyncHandler(async(req, res) => {
    //get the movieId from params
    // then validate movie id
    // find movie by id
    // validate movie
    // retrun res

    const { movieId } = req.params;

    if (!isValidObjectId(movieId)) {
        throw new ApiError(400, "Invalid Movie ID")
    }

    const movie = await Movie.findById(movieId)
    if(!movie){
        throw new ApiError(400, "Movie not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, movie, "Movie fetched Successfully")
    )
});

const updateMovie = asyncHandler(async(req, res) => {
    // get movie Id
    // get title desc etc from body
    // validate them
    // get movie img local path 
    // validate them
    // find movie by id
    // then findById and update in db
    // check if updated
    // return res

    const { movieId } = req.params;
    if (!isValidObjectId(movieId)) {
        throw new ApiError(400, "Invalid Movie Id")
    }

    const { title, description, genre, director, cast, duration } = req.body;

    const posterImgLocalPath = req.file?.path
    // console.log(req.body)
    const movie = await Movie.findById(movieId)
    if (!movie) {
        throw new ApiError(400, "No movie found")
    }

    let posterImgUrl;
    if(posterImgLocalPath){
        posterImgUrl = await uploadOnCloudinary(posterImgLocalPath)
        // console.log(posterImgUrl)
        if(!posterImgUrl.url){
            throw new ApiError(400, "Movie Image not uploaded")
        }else{
            posterImgUrl = posterImgUrl.url;
            // console.log(posterImgUrl)
        }
    }

    const updatedMovie = await Movie.findByIdAndUpdate(movieId,
        {
            $set: {
                title, 
                description,
                posterImgUrl,
                genre,
                director,
                cast,
                duration
            }
        },
        { new: true }
    ) 
    if (!updatedMovie) {
        throw new ApiError(400, "Details were not updated!")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, updatedMovie, "Movie details Updated Successfully")
    )
})

const getAllMovies = asyncHandler(async(req, res) => {
    const movies = await Movie.find();

    if (!movies) {
        throw new ApiError(400, "No movies found")
    }
    return res.status(200)
    .json(
        new ApiResponse(200, movies, "Movie fetched Successfully")
    )
})

const getMoviesByQuery = asyncHandler(async(req, res) => {
    const { genre, title } = req.query;
    let query = {};

    if(title){
        query.title = { $regex: title, $options: "i" };
    }
    if(genre){
        query.genre = { $regex: genre, $options: "i" };
    }

    const movies = await Movie.find(query);
    if(!movies){
        throw new ApiError("400", "No Movies Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, movies, "Movies Fetched Successfully")
    )
})

export {
    addMovie,
    getMovieById,
    updateMovie,
    getAllMovies,
    getMoviesByQuery,
}