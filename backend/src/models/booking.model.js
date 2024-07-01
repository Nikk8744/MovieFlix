import mongoose, {Schema} from "mongoose";

const bookingSchema = new Schema(
    {
        showTime: {
            type: String,
            required: true
        },
        showDate: {
            type: Date,
            required: true
        },
        screen: {
            type: Schema.Types.ObjectId,
            ref: 'Screen', // Reference to the Screen model
            required: true
        },
        seatNumber: [
            {
                row: {
                    type: String,
                    required: true
                },
                col: {
                    type: Number,
                    required: true
                },
                seat_id: {
                    type: String,
                    required: true
                },
                price: {
                    type: Number,
                    required: true
                },
            },
        ],
        totalPrice: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        movie: {
            type: Schema.Types.ObjectId,
            ref: "Movie"
        },
        // could add payment id and payment type 
    },
    { timestamps: true }
)

export const Booking = mongoose.model("Booking", bookingSchema)