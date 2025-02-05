import {createUser, userLogin, logoutUser, profile, updateAccountDetails, changeCurrentPassword, getCurrentUser, deleteAvatar, updateUserAvatar} 
from '../controllers/userController.js'
import { Router } from "express";
import {upload} from "../middleware/multer.middleware.js"
import {verifyUser} from "../middleware/userAuth.middleware.js"
const router = Router()




router.route("/createUser").post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 2
        }
    ]),
    createUser
);


router.post('/login', userLogin);
router.get('/profile', verifyUser,profile)
router.post('/logoutUser', verifyUser,logoutUser)
router.put('/updateDetails/:id', verifyUser,updateAccountDetails)
router.get('/currentUser', verifyUser,getCurrentUser)
router.put('/changePass/:id', verifyUser, changeCurrentPassword)
router.delete('/deleteAvatar/:id', verifyUser, deleteAvatar)
router.put('/updateAvatar/:id', verifyUser, updateUserAvatar)
 export default router;