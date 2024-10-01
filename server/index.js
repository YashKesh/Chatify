import dotenv from 'dotenv'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from "cors"
import mongoose from 'mongoose'
import authRoutes from './routes/Authroute.js'
import contactRoutes from './routes/ContactsRoutes.js'
import setupSocket from './socket.js'
import messagesRoute from './routes/MessagesRoute.js'


dotenv.config();;
const app = express();
const port = process.env.PORT || 3001;
const databaseURL = process.env.DATABASE_URL;

app.use(cors({
    origin: [process.env.ORIGIN],
    methods : ["GET","POST","PUT","DELETE","PATCH"],
    credentials: true
}))

app.use("/uploads/profiles",express.static("uploads/profiles"))
app.use("/uploads/files",express.static("uploads/files"))
app.use(cookieParser( ))
app.use(express.json())
app.use('/api/auth',authRoutes)
app.use('/api/contacts',contactRoutes)
app.use('/api/messages',messagesRoute)

const server = app.listen(port,()=>{
    console.log(`Server is running at http://localhost:${port}`);
})

setupSocket(server);

mongoose
.connect(databaseURL)
.then(()=>{
    console.log("Database connection successfull");
})
.catch(()=>{
    console.log(
        "Database connection failed");
})
