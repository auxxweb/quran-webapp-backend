import mongoose from 'mongoose'
import dotenv from 'dotenv'
dotenv.config()

const url:string = process.env.MONGOOSE_URL || "" 

mongoose.connect(url).then(()=> {
    console.log("Mongoose connected successfully");
}).catch(err => console.log(err))