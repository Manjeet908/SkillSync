import Chat from "../models/chat.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { getSkillFromId } from "../utils/skills.js";
import { io } from "../index.js";

// Get global chat history
export const getGlobalChatHistory = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50 } = req.query;
  
  const messages = await Chat.find({ chatType: 'global' })
    .populate('sender', 'username fullName avatar')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Reverse to get chronological order (oldest first)
  messages.reverse();

  return res.status(200).json(new ApiResponse(
    200,
    messages,
    "Global chat history fetched successfully"
  ));
});

// Get skill-specific chat history
export const getSkillChatHistory = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  
  const skillIdNum = parseInt(skillId);
  
  // Validate skill ID
  const skill = getSkillFromId(skillIdNum);
  if (!skill) {
    throw new ApiError(400, "Invalid skill ID");
  }

  const messages = await Chat.find({ 
    chatType: 'skill', 
    skillId: skillIdNum 
  })
    .populate('sender', 'username fullName avatar')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Reverse to get chronological order (oldest first)
  messages.reverse();

  return res.status(200).json(new ApiResponse(
    200,
    {
      skill,
      messages
    },
    `${skill.name} chat history fetched successfully`
  ));
});

// Send global message
export const sendGlobalMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const newMessage = await Chat.create({
    sender: userId,
    message: message.trim(),
    chatType: 'global'
  });

  const populatedMessage = await Chat.findById(newMessage._id)
    .populate('sender', 'username fullName avatar')
    .lean();

  // Broadcast to all users in global chat via Socket.io
  io.to('global-chat').emit('receive_global_message', populatedMessage);

  return res.status(201).json(new ApiResponse(
    201,
    populatedMessage,
    "Global message sent successfully"
  ));
});

// Send skill-specific message
export const sendSkillMessage = asyncHandler(async (req, res) => {
  const { skillId } = req.params;
  const { message } = req.body;
  const userId = req.user._id;

  const skillIdNum = parseInt(skillId);
  
  // Validate skill ID
  const skill = getSkillFromId(skillIdNum);
  if (!skill) {
    throw new ApiError(400, "Invalid skill ID");
  }

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const newMessage = await Chat.create({
    sender: userId,
    message: message.trim(),
    chatType: 'skill',
    skillId: skillIdNum
  });

  const populatedMessage = await Chat.findById(newMessage._id)
    .populate('sender', 'username fullName avatar')
    .lean();

  // Broadcast to all users in this skill chat via Socket.io
  io.to(`skill-chat:${skillIdNum}`).emit('receive_skill_message', {
    ...populatedMessage,
    skill
  });

  return res.status(201).json(new ApiResponse(
    201,
    {
      skill,
      message: populatedMessage
    },
    `Message sent to ${skill.name} chat successfully`
  ));
});

// Get all available chat rooms (global + all skills)
export const getChatRooms = asyncHandler(async (req, res) => {
  const { getSkillsDocument } = await import("../utils/skills.js");
  const skills = getSkillsDocument();

  const chatRooms = [
    {
      id: 'global',
      name: 'Global Chat',
      description: 'Chat with everyone',
      type: 'global',
      image: null
    },
    ...skills.map(skill => ({
      id: `skill-${skill.id}`,
      name: skill.name,
      description: skill.description || `Chat about ${skill.name}`,
      type: 'skill',
      skillId: skill.id,
      image: skill.image
    }))
  ];

  return res.status(200).json(new ApiResponse(
    200,
    chatRooms,
    "Chat rooms fetched successfully"
  ));
});

// Edit message (only by sender)
export const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { message } = req.body;
  const userId = req.user._id;

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message cannot be empty");
  }

  const existingMessage = await Chat.findById(messageId);
  if (!existingMessage) {
    throw new ApiError(404, "Message not found");
  }

  if (existingMessage.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only edit your own messages");
  }

  const updatedMessage = await Chat.findByIdAndUpdate(
    messageId,
    {
      message: message.trim(),
      editedAt: new Date(),
      isEdited: true
    },
    { new: true }
  ).populate('sender', 'username fullName avatar')
   .populate('recipient', 'username fullName avatar');

  // Broadcast edit to appropriate room via Socket.io
  if (existingMessage.chatType === 'global') {
    io.to('global-chat').emit('message_edited', updatedMessage);
  } else if (existingMessage.chatType === 'skill') {
    io.to(`skill-chat:${existingMessage.skillId}`).emit('message_edited', updatedMessage);
  } else if (existingMessage.chatType === 'private') {
    // Send to both sender and recipient
    io.to(`user:${existingMessage.sender}`).emit('message_edited', updatedMessage);
    io.to(`user:${existingMessage.recipient}`).emit('message_edited', updatedMessage);
  }

  return res.status(200).json(new ApiResponse(
    200,
    updatedMessage,
    "Message updated successfully"
  ));
});

// Delete message (only by sender)
export const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const existingMessage = await Chat.findById(messageId);
  if (!existingMessage) {
    throw new ApiError(404, "Message not found");
  }

  if (existingMessage.sender.toString() !== userId.toString()) {
    throw new ApiError(403, "You can only delete your own messages");
  }

  await Chat.findByIdAndDelete(messageId);

  // Broadcast deletion to appropriate room via Socket.io
  const deleteData = {
    _id: messageId,
    sender: existingMessage.sender
  };

  if (existingMessage.chatType === 'global') {
    io.to('global-chat').emit('message_deleted', deleteData);
  } else if (existingMessage.chatType === 'skill') {
    io.to(`skill-chat:${existingMessage.skillId}`).emit('message_deleted', deleteData);
  } else if (existingMessage.chatType === 'private') {
    // Send to both sender and recipient
    io.to(`user:${existingMessage.sender}`).emit('message_deleted', deleteData);
    io.to(`user:${existingMessage.recipient}`).emit('message_deleted', deleteData);
  }

  return res.status(200).json(new ApiResponse(
    200,
    null,
    "Message deleted successfully"
  ));
});

// Helper function to generate conversation ID
const generateConversationId = (userId1, userId2) => {
  const sortedIds = [userId1.toString(), userId2.toString()].sort();
  return `${sortedIds[0]}_${sortedIds[1]}`;
};

// Get private chat history between two users
export const getPrivateChatHistory = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 50 } = req.query;
  const currentUserId = req.user._id;

  // Validate recipient user exists
  const recipient = await User.findById(userId).select('username fullName avatar');
  if (!recipient) {
    throw new ApiError(404, "User not found");
  }

  // Generate conversation ID
  const conversationId = generateConversationId(currentUserId, userId);

  const messages = await Chat.find({ 
    chatType: 'private',
    conversationId: conversationId
  })
    .populate('sender', 'username fullName avatar')
    .populate('recipient', 'username fullName avatar')
    .sort({ timestamp: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .lean();

  // Reverse to get chronological order (oldest first)
  messages.reverse();

  return res.status(200).json(new ApiResponse(
    200,
    {
      recipient,
      conversationId,
      messages
    },
    "Private chat history fetched successfully"
  ));
});

// Send private message to a user
export const sendPrivateMessage = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { message } = req.body;
  const currentUserId = req.user._id;

  if (currentUserId.toString() === userId.toString()) {
    throw new ApiError(400, "Cannot send message to yourself");
  }

  // Validate recipient user exists
  const recipient = await User.findById(userId).select('username fullName avatar');
  if (!recipient) {
    throw new ApiError(404, "Recipient user not found");
  }

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message cannot be empty");
  }

  // Generate conversation ID
  const conversationId = generateConversationId(currentUserId, userId);

  const newMessage = await Chat.create({
    sender: currentUserId,
    recipient: userId,
    message: message.trim(),
    chatType: 'private',
    conversationId: conversationId
  });

  const populatedMessage = await Chat.findById(newMessage._id)
    .populate('sender', 'username fullName avatar')
    .populate('recipient', 'username fullName avatar')
    .lean();

  // Send to recipient via Socket.io
  io.to(`user:${userId}`).emit('receive_private_message', populatedMessage);

  return res.status(201).json(new ApiResponse(
    201,
    {
      recipient,
      message: populatedMessage
    },
    "Private message sent successfully"
  ));
});

// Get all conversations for the current user
export const getUserConversations = asyncHandler(async (req, res) => {
  const currentUserId = req.user._id;

  // Get all private messages where user is either sender or recipient
  const conversations = await Chat.aggregate([
    {
      $match: {
        chatType: 'private',
        $or: [
          { sender: currentUserId },
          { recipient: currentUserId }
        ]
      }
    },
    {
      $sort: { timestamp: -1 }
    },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        messageCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.sender',
        foreignField: '_id',
        as: 'senderInfo'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'lastMessage.recipient',
        foreignField: '_id',
        as: 'recipientInfo'
      }
    },
    {
      $addFields: {
        otherUser: {
          $cond: [
            { $eq: ['$lastMessage.sender', currentUserId] },
            { $arrayElemAt: ['$recipientInfo', 0] },
            { $arrayElemAt: ['$senderInfo', 0] }
          ]
        }
      }
    },
    {
      $project: {
        conversationId: '$_id',
        lastMessage: {
          message: '$lastMessage.message',
          timestamp: '$lastMessage.timestamp',
          isEdited: '$lastMessage.isEdited',
          sender: '$lastMessage.sender'
        },
        otherUser: {
          _id: '$otherUser._id',
          username: '$otherUser.username',
          fullName: '$otherUser.fullName',
          avatar: '$otherUser.avatar'
        },
        messageCount: 1
      }
    },
    {
      $sort: { 'lastMessage.timestamp': -1 }
    }
  ]);

  return res.status(200).json(new ApiResponse(
    200,
    conversations,
    "User conversations fetched successfully"
  ));
});

