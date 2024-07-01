import mongoose, {Schema} from "mongoose";

const screenSchema = new Schema(
    {
        screenName: {
            type: String,
            required: true,
        },
        cinema: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true
        },
        seatsCapacity: {
            type: Number,
            required: true,
        },
        showTime: {
          type: String,
          req: true,
        },
        movie: {
            type: Schema.Types.ObjectId,
            ref: "Movie",
        },
        seats: [
            {
              row: {
                type: String,
                required: true,
              },
              col: {
                type: Number,
                required: true,
              },
              isAvailable: {
                type: Boolean,
                default: true,
              },
              seat_id: {
                type: String,
                required: true,
              },
              price: {
                type: Number,
                required: true,
              },
            },
          ],
    },
    {timestamps: true}
)


// Function to generate seats based on seatsCapacity
screenSchema.pre("save", function (next) {
  const screen = this;
  if (!screen.isModified("seatsCapacity")) return next();

  screen.seats = [];
  const rows = ['A', 'B', 'C', 'D', 'E']; // Define your rows as needed
  const cols = 10; // Define number of columns per row as needed
  const price = 100;
  let seat_id = 1;
  for (let i = 0; i < rows.length; i++) {
      for (let j = 1; j <= cols; j++) {
          screen.seats.push({
              row: rows[i],
              col: j,
              price: price,
              seat_id: seat_id++,
              isAvailable: true, // Initially all seats are available
          });
      }
  }

  next();
});

export const Screen = mongoose.model("Screen", screenSchema)