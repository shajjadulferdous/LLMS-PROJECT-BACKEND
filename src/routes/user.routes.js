import { Router } from "express";
const router = Router();
import {upload} from '../middlewares/multer.middlewares.js'
import {RegisterUser} from '../controllers/user.controller.js'
router.route('/register').post(
    upload.fields(
        [{
            name:"profilePicture",
            maxCount : 1
        }]
        
    ),
    RegisterUser
)
export default router;