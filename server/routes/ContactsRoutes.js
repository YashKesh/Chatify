import {Router} from 'express'
import { getContactForDMList, searchContacts } from '../controllers/ContactController.js';
import { verifyToken } from '../middlewares/Authmiddleware.js';
const contactRoutes = Router();
contactRoutes.post('/search',verifyToken, searchContacts);
contactRoutes.get("/get-contacts-for-dm",verifyToken,getContactForDMList)

export default contactRoutes;

