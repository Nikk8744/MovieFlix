import { isValidObjectId } from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Movie } from "../models/movie.model.js";
import { Screen } from "../models/Screen.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addScreen = asyncHandler(async(req, res) => {
    const { screenName, cinema, city, seatsCapacity, showTime } = req.body;
    const { movieId } = req.params;
    if(
        [screenName, cinema, city, showTime].some((field) => {
            if (typeof field === 'Number') {
                field = String(field).trim();
            }
            return field === "";
        })
    ){
        throw new ApiError(400, "All fields are required")
    }
    if(!isValidObjectId(movieId)){
        throw new ApiError(400, "Invalid Movie ID")
    }

    const existingMovie = await Movie.findById(movieId);
    if (!existingMovie) {
        throw new ApiError(400, "No movie Screens found!!")
    }

    const screen = await Screen.create({
        screenName, 
        cinema,
        city,
        seatsCapacity,
        showTime,
        movie: existingMovie?._id,
    })

    existingMovie.screens.push(screen._id);
    await existingMovie.save();

    if(!screen){
        throw new ApiError(400, "Something went wrong while creating screen")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, screen, "Screen created successfully!!")
    )
})

const deleteScreen = asyncHandler(async(req, res) => {
    const { screenId } = req.params;
    if (!isValidObjectId(screenId)) {
        throw new ApiError(400, "Invalid Screen ID")
    }

    const existingScreen = await Screen.findById(screenId)
    if (!existingScreen) {
        throw new ApiError(400, "No such screen found")
    }

    const deletedScreen = await Screen.findByIdAndDelete(screenId);
    if(!deletedScreen){
        throw new ApiError(400, "Something went wrong while deleting screen")
    }

    const movie = await Movie.findByIdAndUpdate(
        deletedScreen.movie,
        { $pull: { screens: screenId } },
        { new: true }
      );
    
      if (!movie) {
        throw new ApiError(404, "Movie not found");
      }
    

    return res.status(200)
    .json(
        new ApiResponse(200, deletedScreen, "Screen deleted successfully")
    )
})

const getScreensForMovie = asyncHandler(async(req, res) => {
    const { movieId } = req.params;
    if (!isValidObjectId(movieId)) {
        throw new ApiError(400, "Invalid Movie ID")
    }

    const movie = await Movie.findById(movieId).populate("screens");
    if (!movie) {
        throw new ApiError(400, "Movie Screens Not Founds")
    }
 
    return res.status(200)
    .json(
        new ApiResponse(200, movie.screens, "Movie Screens Fetched Successfully!!")
    )
})

export {
    addScreen,
    deleteScreen,
    getScreensForMovie,
}
