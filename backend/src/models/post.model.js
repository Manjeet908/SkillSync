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
    category: {
        type: String,
        required: true,
        enum: ["web development", "mobile development", "graphic design", "music", "dance", "photography", "art", "writing", "content creation", "other"]
    },
    creator: {
        type: Schema.Types.ObjectId,
        ref: "user",
        required: true
    },
}, { timestamps: true });

postSchema.plugin(mongooseAggregatePaginate)

export const Post = mongoose.model('post', postSchema)