const mongoose = require("mongoose");

//connect to MongoDB
const connectDB=async()=>{
    await mongoose.connect(process.env.MONGODB_CONNECT_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
console.log("MongoDB connected");
}

module.exports=connectDB;