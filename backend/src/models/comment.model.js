import mongoose, {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const commentSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function(v) {
                return v.length > 0;
            },
            message: "Content cannot be empty"
        }
    },
    type: { 
        type: String, 
        enum: ["normal", "feedback"], 
        default: "normal"
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post",
        required: true      //remove if generic comment to be stored for various models
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
}, { timestamps: true })


commentSchema.plugin(mongooseAggregatePaginate)

export const Comment = mongoose.model("Comment", commentSchema)