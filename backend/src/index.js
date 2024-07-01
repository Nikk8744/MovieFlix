import connectDB from "./db/index.js";
import { app } from "./app.js";

process.loadEnvFile;

// db connect krna baki hai connectDB se and mongodb uri bhi copy krni hai
connectDB()
.then(() => {
    app.listen(process.env.PORT || 6000, () => {
        console.log(`Server running on port: ${process.env.PORT}`)
    })
})
.catch((err) => {
    console.log("MONGODB connection failed!!", err);
});
