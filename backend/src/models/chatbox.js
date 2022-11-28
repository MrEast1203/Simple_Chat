import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatBoxSchema = new Schema({
  name: { type: String, required: [true, 'Name field is required.'] },
  users: [{ type: mongoose.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Types.ObjectId, ref: 'Message' }],
});

module.exports = mongoose.model('ChatBox', ChatBoxSchema);
