import Message from './models/message';
import { UserModel, MessageModel, ChatBoxModel } from './models/chatbox';

const makeName = (name, to) => {
  return [name, to].sort().join('_');
};

const validateUser = async (name) => {
  console.log('Finding...' + name);
  const existing = await UserModel.findOne({ name });
  console.log(existing);
  if (existing) return existing;
  else return await new UserModel({ name }).save();
};

const validateChatBox = async (name, participants) => {
  let box = await ChatBoxModel.findOne({ name });
  if (!box) box = await new ChatBoxModel({ name, users: participants }).save();
  return box.populate(['users', { path: 'messages', populate: 'sender' }]);
};

const sendData = (data, ws) => {
  ws.send(JSON.stringify(data));
};
const sendStatus = (payload, ws) => {
  sendData(['status', payload], ws);
};
const broadcastMessage = (wss, data, status) => {
  wss.clients.forEach((client) => {
    sendData(data, client);
    sendStatus(status, client);
  });
};

const chatBoxes = {};

export default {
  initData: (ws) => {
    Message.find()
      .sort({ created_at: -1 })
      .limit(100)
      .exec((err, res) => {
        if (err) throw err;
        // initialize app with existing messages
        sendData(['init', res], ws);
        // broadcastMessage(ws, ['init', res], 'status');
      });
  },
  onMessage: (wss, ws) => async (byteString) => {
    const { data } = byteString;
    const [task, payload] = JSON.parse(data);
    if (!chatBoxes[ws.box]) chatBoxes[ws.box] = new Set();
    chatBoxes[ws.box].add(ws);
    if (ws.box !== '' && chatBoxes[ws.box]) chatBoxes[ws.box].delete(ws);
    switch (task) {
      case 'input': {
        const { name, body } = payload;
        // Save payload to DB
        const message = new Message({ name, body });
        try {
          await message.save();
        } catch (e) {
          throw new Error('Message DB save error: ' + e);
        }
        broadcastMessage(wss, ['output', [payload]], {
          type: 'success',
          msg: 'Message sent.',
        });
        break;
      }
      case 'clear': {
        Message.deleteMany({}, () => {
          // sendData(['cleared'], ws);
          // sendStatus({ type: 'info', msg: 'Message cache cleared.' }, ws);
          broadcastMessage(wss, ['cleared'], {
            type: 'info',
            msg: 'Message cache cleared.',
          });
        });
        break;
      }
      case 'CHAT': {
        const { name, to } = payload;
        validateChatBox(name, to)
          .find()
          .sort({ created_at: -1 })
          .limit(100)
          .exec((err, res) => {
            if (err) throw err;
            // initialize app with existing messages
            sendData(['CHAT', res], ws);
          });
        break;
      }
      case 'MESSAGE': {
        const { name, to, body } = payload;
        // Save payload to DB
        const message = new MessageModel(
          validateChatBox(name, to),
          validateUser(name),
          body
        );
        try {
          await message.save();
        } catch (e) {
          throw new Error('Message DB save error: ' + e);
        }
        broadcastMessage(wss, ['MESSAGE', [payload]], {
          type: 'success',
          msg: 'Message sent.',
        });
        break;
      }
      case 'CLEAR': {
      }
      default:
        break;
    }
  },
};
