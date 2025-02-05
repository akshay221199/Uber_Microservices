import {createCaptain, captainLogin, logoutUser, profile, updateAccountDetails, changeCurrentPassword, getCurrentCap, deleteAvatar, updateUserAvatar} 
 from '../controllers/captainController.js'
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
    createCaptain
);


router.post('/login', captainLogin);
router.get('/profile', verifyUser,profile)
router.post('/logoutUser', verifyUser,logoutUser)
router.put('/updateDetails/:id', verifyUser,updateAccountDetails)
router.get('/currentUser', verifyUser,getCurrentCap)
router.put('/changePass/:id', verifyUser, changeCurrentPassword)
router.delete('/deleteAvatar/:id', verifyUser, deleteAvatar)
router.put('/updateAvatar/:id', verifyUser, updateUserAvatar)
 export default router;