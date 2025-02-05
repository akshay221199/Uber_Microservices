import mongoose from "mongoose";

const rideSchema = new mongoose.Schema({
    captain: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Captain',
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pickup: {
        type: String,
        required: true
    },
    destination: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: [ 'requested', 'accepted', 'started', 'completed' ],
        default: 'requested'
    },
}, {
    timestamps: true
})


export default  mongoose.model('ride', rideSchema);