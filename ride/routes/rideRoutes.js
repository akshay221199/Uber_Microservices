import { Router } from "express";
const router = Router();
import {verifyUser} from '../middleware/auth.middleware.js'
import  {createRide} from '../controller/ride.controller.js'

router.post('/create-ride',verifyUser, createRide)
// router.put('/accept-ride',authMiddleware.captainAuth, rideController.acceptRide)


export default router;