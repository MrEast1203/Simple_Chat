import mongoose from 'mongoose';

const { Schema } = mongoose;

const MessageSchema = new Schema({
  chatBox: { type: mongoose.Types.ObjectId, ref: 'ChatBox' },
  sender: { type: mongoose.Types.ObjectId, ref: 'User' },
  body: { type: String, required: [true, 'Body field is required.'] },
});

module.exports = mongoose.model('Message', MessageSchema);
