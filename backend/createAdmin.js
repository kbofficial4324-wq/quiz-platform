import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "./models/user.js";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    const existingAdmin = await User.findOne({
        email: "admin@gmail.com"
    });


    if(existingAdmin){

        console.log("Admin already exists");

        process.exit();

    }


    const hashedPassword = await bcrypt.hash(
        "Admin@123",
        10
    );


    await User.create({

        name: "Admin",

        email: "admin@gmail.com",

        password: hashedPassword,

        role: "admin"

    });


    console.log("Admin Created Successfully");

    process.exit();

})
.catch(error => {

    console.log(error);

});