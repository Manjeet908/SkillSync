import { Notification } from "../models/notification.model.js"
import { Follow } from "../models/follow.model.js"
import { io } from "../index.js"
import { asyncHandler } from "../utils/AsyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"

const notifyOnNewPost = async(post, creator) => {

    try {
        const follows = await Follow.find({creator: creator._id})

        if (!Array.isArray(follows) || follows.length === 0) {
            console.log("Unable to fetch Follows ", follows)
            return;
        }
        
        const notifications = follows.map((follow) => ({
            recipient: follow.follower,
            sender: creator._id,
            contentId: post._id,
            message: `Watch out ${creator.username} added a new Post`
        }));

        await Notification.insertMany(notifications);

        follows.forEach(follow => {
            io.to(follow.follower.toString()).emit("new_notification", {
                recipient: follow.follower,
                sender: creator,
                contentId: post._id,
                message: `Watch out ${creator.username} added a new Post`,
                isRead: false,
                createdAt: new Date(),
                sentUsing: "socket.io"
            });
        });

    } catch (error) {
        console.error("Error while notifying followers after post: ", post);        
    }

}

const getUserNotifications = asyncHandler(async(req, res) => {

    const user = req.user

    const userNotifications = await Notification.find({recipient: user._id, isRead: false}).populate('sender')
    
    return res
    .status(200)
    .json(
        new ApiResponse(200, userNotifications, "user notifications fetched successfully")
    )

})

const markAsReadMany = asyncHandler(async(req, res) => {
    const user = req.user;
    const { contentIds } = req.body; 

    if (!Array.isArray(contentIds) || contentIds.length === 0) {
        throw new ApiError(400, "No content IDs provided");
    }

    const result = await Notification.updateMany(
        { 
            contentId: { $in: contentIds },
            recipient: user._id 
        },
        { $set: { isRead: true } }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(200, result, "Notifications marked as read")
    );
})

const markAllAsRead = asyncHandler(async(req, res) => {
    const user = req.user;
    const result = await Notification.updateMany(
        { recipient: user._id, isRead: false },
        { $set: { isRead: true } }
    );
    return res
    .status(200)
    .json(
        new ApiResponse(200, result, "All notifications marked as read")
    );
});

const deleteReadNotifications = asyncHandler(async(req, res) => {

    const deletedCount = await Notification.deleteMany({recipient: req.user?._id, isRead: true})

    return res
    .status(200)
    .json(
        new ApiResponse(200, deletedCount, "Read Notifications Deleted Successfully")
    )

})

export {
    notifyOnNewPost,
    getUserNotifications,
    markAsReadMany,
    markAllAsRead,
    deleteReadNotifications
}