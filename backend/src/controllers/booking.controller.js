import { isValidObjectId } from "mongoose";
import { Booking } from "../models/booking.model.js";
import { Movie } from "../models/movie.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { Screen } from "../models/Screen.model.js";

const newBooking = asyncHandler(async(req, res) => {
    
    const { showDate, seatNumber, showTime, totalPrice  } = req.body;
    const {movieId} = req.params;
    const userId  = req.user._id;

    if(
        [movieId, showDate, seatNumber, showTime, totalPrice].some((field) => {
            if (typeof field === 'Number' || typeof field !== 'String') {
                field = field.toString();
            }
            return field.trim() === "";
        })
    ){
        throw new ApiError(400, "All fields are required!!")
    }

    const existingMovie = await Movie.findById(movieId)
    if(!existingMovie){
        throw new ApiError(400, "Movie was not found")
    }

    const user = await User.findById(userId)
    if (!user) {
        throw new ApiError(400, "User was not found!!!")
    }

    // const screenWithSeats = await Screen.findById(screenId).populate("seats");
    // console.log(screenWithSeats);

// Find the screen associated with the movie and showtime
    const screens = await Screen.find({movie: movieId, showTime});
    if (!screens) {
        throw new ApiError(400, "No screens found")
    }

        // Filter screens that have enough available seats for the requested seatNumbers
        let selectedScreen = null;
        let reservedSeats = []; // Array to hold reserved seats
        for (let i = 0; i < screens.length; i++) {
            const screen = screens[i];
            const availableSeats = screen.seats.filter(seat => seat.isAvailable);
            
            // Check if this screen has enough available seats
            if (availableSeats.length >= seatNumber.length) {
                // Attempt to reserve seats on this screen
                reservedSeats = [];
                for (let j = 0; j < seatNumber.length; j++) {
                    const { row, col, seat_id, price } = seatNumber[j];
                    const seat = availableSeats.find(s => s.row === row && s.col === col);
                    
                    if (!seat) {
                        continue; // Seat not found or not available
                    }
    
                    // Mark seat as reserved
                    seat.isAvailable = false;
                    reservedSeats.push({ row, col, seat_id, price });
                }
    
                // If successfully reserved all requested seats, select this screen
                if (reservedSeats.length === seatNumber.length) {
                    selectedScreen = screen;
                    // console.log("Selected: ",selectedScreen)
                    break;
                }
            }
        }
    
        // If no screen is found with available seats
        if (!selectedScreen) {
            throw new ApiError(400, 'No available screens for the specified showTime and seat numbers!');
        }
    

    // console.log(req.user._id)
    const booking = await Booking.create({
        movie: existingMovie?._id,
        showDate,
        seatNumber: reservedSeats,
        user: req.user?._id,
        showTime,
        totalPrice,
    })

    if (!booking) {
        throw new ApiError(400, "Something went wrong while creating booking")
    }
    
    await selectedScreen.save();

    user.bookingHistory.push(booking._id);
    await user.save();

    return res.status(200)
    .json(
        new ApiResponse(200, booking, "Booking created Successfully")
    )
})

const getBookingById = asyncHandler(async(req, res) => {
    const { bookingId } = req.params;
    if (!isValidObjectId(bookingId)) {
        throw new ApiError(400, "Invalid Booking ID")
    }

    const booking = await Booking.findById(bookingId);
    if(!booking){
        throw new ApiError(400, "No Booking Found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, booking, "Booking fetched successfully")
    )
})

// to get all bookings for a user
const getAllBookingsForUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    // can change the fields below as per my requirements  
    const bookings = await Booking.find({ user: userId })
    .populate({path: 'movie', select: "title"})
    .populate({
        path: 'screen',
        select: 'screenName cinema city' // Select specific fields from the 'screen' document
    })
    .select('seatNumber.seat_id totalPrice showDate showTime')


    if (!bookings) {
        throw new ApiError(400, "No Bookings Found!!")
    }
    console.log(bookings)

    return res.status(200)
    .json(
        new ApiResponse(200, bookings, "User's Bookings Fetched successfully")
    )
})

// to get all bookings for a movie
const getAllBookingsForMovie = asyncHandler(async(req, res) => {
    const { movieId } = req.params;
    if (!isValidObjectId(movieId)) {
        throw new ApiError(400, "Invalid Movie ID")
    }

    const bookings = await Booking.find({movie: movieId })
    .populate({path: 'user', select: "name email"})
    .populate({
        path: 'screen',
        select: 'screenName cinema city' // Select fields from the 'Screen' document you want to populate
    })
    .select('seatNumber totalPrice showDate showTime'); // Select specific fields from the 'Booking' document


    if (!bookings) {
        throw new ApiError(400, "No Bookings Found!!")
    }
    console.log(bookings)
    return res.status(200)
    .json(
        new ApiResponse(200, bookings, "Movie Bookings Fetched successfully")
    )
})

const deleteBooking = asyncHandler(async(req, res) => {
    const { bookingId } = req.params;
    if(!isValidObjectId(bookingId)){
        throw new ApiError(400, "Invalid Booking ID")
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
        throw new ApiError(400, "No Booking found")
    } 

    if(booking.user.toString() !== req.user._id.toString()){
        throw new ApiError(400, "Unauthorized!!")
    }
    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    if (!deletedBooking) {
        throw new ApiError(400, "Something went wrong while deleteing your booking")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, deletedBooking, "Booking Deleted Successfully")
    )
})

export {
    newBooking,
    getBookingById,
    deleteBooking,
    getAllBookingsForUser,
    getAllBookingsForMovie,
}