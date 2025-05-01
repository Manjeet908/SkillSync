import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const likeSchema = new Schema({
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comment"
    },
    likedBy: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    
}, {timestamps: true})

likeSchema.plugin(mongooseAggregatePaginate)

likeSchema.pre("save", function (next) {
    if (!this.post && !this.comment) {
        return next(new Error("Either post or comment must be provided"))
    }
    if (this.post && this.comment) {
        return next(new Error("Only one of post or comment can be provided"))
    }
    next()
})

export const Like = mongoose.model("Like", likeSchema)