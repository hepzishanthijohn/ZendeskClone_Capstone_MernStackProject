const express = require('express');
const connectDB = require('./db');
const adminRoutes = require ('./routes/adminRoutes');
const studentRoutes = require ('./routes/studentRoutes');




require("dotenv").config();
connectDB();

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());
app.use('/admin',adminRoutes)
app.use('/student',studentRoutes);



const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>{
    console.log(`server running on port : ${PORT}`)
})