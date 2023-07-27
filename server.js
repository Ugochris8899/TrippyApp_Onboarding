require("./config/trippyDB");
const express = require("express");
const userRouter = require("./routes/userRouter");
const dotenv = require("dotenv");
dotenv.config();

const PORT = 1111;

const app = express();
app.use(express.json());

app.use("/api", userRouter);

app.listen( PORT, () => {
    console.log( `Server is listening to port: ${ PORT }` );
} );