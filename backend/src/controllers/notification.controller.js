import { Notification } from "../models/notification.model.js"
import { Follow } from "../models/follow.model.js"
import { io } from "../index.js"

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
                sender: creator._id,
                contentId: post._id,
                message: `Watch out ${creator.username} added a new Post`
            });
        });

    } catch (error) {
        console.error("Error while notifying followers after post: ", post);        
    }
    console.log("Ending")
}

export {
    notifyOnNewPost
}