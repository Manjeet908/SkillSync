import mongoose, {Schema} from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true, 
        },
        fullName: {
            type: String,
            required: true,
            trim: true
        },
        avatar: {
            default: "http://localhost:8000/images/default_avatar.jpg",
            type: String, // cloudinary url
        },
        coverImage: {
            default: "http://localhost:8000/images/default_coverImage.jpg",
            type: String, // cloudinary url
        },
        bio: {
            type: String,
            trim: true,
            maxLength: 250
        },
        // role: { 
        //     type: String, 
        //     enum: ["creator", "user"], 
        //     default: "user" 
        // }, include role if you want to have different roles, currently we have only one role
        location: {
            type: {
                type: String,
                enum: ["Point"],
                default: "Point"
            },
            coordinates: {
                type: [Number],
                default: [0, 0]
            }
        },
        knownSkills: [
        {
            type: Number,
            validate: {
            validator: (val) => val >= 0 && val < 50,
            message: "Invalid skill index"
            }
        }
        ],
        interestedSkills: [
        {
            type: Number,
            validate: {
            validator: (val) => val >= 0 && val < 50,
            message: "Invalid skill index"
            }
        }
        ],
        wantToBeHired: {
            type: Boolean,
            default: false
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        },
    },
    {
        timestamps: true
    }
)

userSchema.index({ knownSkills: 1 })
userSchema.index({ interestedSkills: 1 })
userSchema.index({location: "2dsphere"})

userSchema.pre("save", async function (next) {
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)