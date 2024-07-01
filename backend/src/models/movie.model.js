import mongoose, { Schema } from "mongoose";

const movieSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, "Please provide movie title"],
            trim: true
        },
        description: {
            type: String,
            required: [true, "Please provide description"],
            trim: true,
        },
        posterImgUrl: {
            type: String,
            required: [true, "Please provide Movie Image"]
        },
        genre: {
            type: String,
            required: [true, "Please provide the genre"],
            trim: true,
        },
        director: {
            type: String,
            trim: true,
        },
        cast: {
            type: String,
            trim: true,
        },
        duration: {
            type: String,
            required: [true, 'Please provide duration']
        },
        screens: [{
            type: Schema.Types.ObjectId,
            ref: "Screen",
        }],
    },
    { timestamps: true }
)

export const Movie = mongoose.model("Movie", movieSchema);