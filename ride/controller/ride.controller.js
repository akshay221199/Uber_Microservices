    import {ApiError} from '../utility/ApiError.js'
    import {ApiResponse} from '../utility/ApiResponse.js'
    import {AsyncHandler} from '../utility/AsyncHandler.js'
    import { subscribeToQueue, publishToQueue } from '../service/rabbit.js'
    import rideModel from '../model/rideModel.js'


    const createRide =AsyncHandler(async(req, res)=>{

        const { pickup, destination } = req.body;
        console.log('logged data from ride controler', req.user._id);
        const newRide = new rideModel({
            user: req.user._id,
            pickup,
            destination
        })
        // console.log('new ride data from ride controller', newRide);
        
        // console.log('This is ride controller');
        
        await newRide.save();
        // console.log('new ride data from ride controller', newRide);


        publishToQueue("new-ride", JSON.stringify(newRide))
            .then(() => {
                console.log('New ride published successfully');
            })
            .catch(error => {
                console.error('Error publishing ride:', error);
            });

        throw new ApiResponse(201, 'Ride created successfully', newRide)



    });

    export {createRide};