const dotenv = require("dotenv");
const express = require("express");
const auth = require("./Modules/auth");
const registerRouter = require("./Routes/registerRouter");
const notesRouter = require("./Routes/notesRouter");






const cors = require("cors");





dotenv.config();
const app = express();

app.use(cors());

app.get("/",(req,res)=>{
    res.send("Hello World");
})

app.use(express.json());
app.use("/register", registerRouter);

app.use("/",cors(),auth.authenticateUser);
app.use("/notes", cors(),notesRouter);




const PORT = process.env.PORT || 3004;
app.listen(PORT,()=>{
    console.log(`App is Running on port ${PORT}`);
});