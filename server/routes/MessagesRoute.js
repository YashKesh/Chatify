import { Router } from "express";
import { verifyToken } from "../middlewares/Authmiddleware.js";
import { getMessages, uploadFile } from "../controllers/MessageController.js";
import multer from 'multer'
const messagesRoute= Router();
const upload = multer({dest: "uploads/files"})
messagesRoute.post("/get-messages",verifyToken,getMessages)
messagesRoute.post("/upload-file",verifyToken,upload.single("file"),uploadFile)
export default messagesRoute;