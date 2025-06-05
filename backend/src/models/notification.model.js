import mongoose, {Schema} from "mongoose"


const notificationSchema = new Schema({
    recipient: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    contentId: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
}, {timestamps: true})

notificationSchema.index({ createdAt: 1 }, { expires: '1d' }); // change it later to 7d or 15d

export const Notification = mongoose.model("Notification", notificationSchema)