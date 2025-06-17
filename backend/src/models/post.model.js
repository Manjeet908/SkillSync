import mongoose, { Schema } from 'mongoose'
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2'

const postSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 150
    },
    description: {
        type: String,
        trim: true
    },
    media: [
        {
            type: String,
        }
    ],
    skillShowcasing: {
        type: Number,
        default: 0, // 0 = "Other"
        validate: {
        validator: (val) => val >= 0 && val < 50,
        message: "Invalid skill index"
        }
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
    creatorUsername: {
        type: String,
        required: true,
        trim: true
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

postSchema.plugin(mongooseAggregatePaginate)

export const Post = mongoose.model('Post', postSchema)