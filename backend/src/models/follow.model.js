import mongoose, {Schema} from "mongoose"


const followSchema = new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    follower: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    emailNotify: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})


export const Follow = mongoose.model("Like", followSchema)