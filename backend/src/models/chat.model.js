import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true,
    maxLength: 1000
  },
  chatType: {
    type: String,
    enum: ['global', 'skill', 'private'],
    required: true,
    default: 'global'
  },
  skillId: {
    type: Number,
    validate: {
      validator: function(val) {
        // Only validate skillId if chatType is 'skill'
        if (this.chatType === 'skill') {
          return val >= 0 && val < 50;
        }
        return val === undefined || val === null;
      },
      message: "Invalid skill index"
    }
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(val) {
        // Only validate recipient if chatType is 'private'
        if (this.chatType === 'private') {
          return val !== undefined && val !== null;
        }
        return val === undefined || val === null;
      },
      message: "Recipient is required for private messages"
    }
  },
  conversationId: {
    type: String,
    validate: {
      validator: function(val) {
        // Only validate conversationId if chatType is 'private'
        if (this.chatType === 'private') {
          return val !== undefined && val !== null;
        }
        return val === undefined || val === null;
      },
      message: "Conversation ID is required for private messages"
    }
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  },
  editedAt: {
    type: Date
  },
  isEdited: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

chatSchema.index({ chatType: 1, timestamp: -1 });
chatSchema.index({ skillId: 1, timestamp: -1 });
chatSchema.index({ conversationId: 1, timestamp: -1 });
chatSchema.index({ sender: 1, recipient: 1, timestamp: -1 });
chatSchema.index({ sender: 1, timestamp: -1 });

export default mongoose.model("Chat", chatSchema);