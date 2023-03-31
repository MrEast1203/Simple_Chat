const UserModel = require('./models/user');
const MessageModel = require('./models/message');
const ChatBoxModel = require('./models/chatbox');
const makeName = (name, to) => {
  return [name, to].sort().join('_');
};

// const validateUser = async (name) => {
//   console.log('Finding...' + name);
//   let existing = await UserModel.findOne({ name });
//   try {
//     if (existing) {
//       console.log('user exists');
//       console.log(existing);
//     } else {
//       const newUser = await new UserModel({ name });
//       console.log('adding', newUser);
//       newUser.save();
//     }
//   } catch (e) {
//     console.log(e);
//   }
// };

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
  onMessage: (wss, ws) => async (byteString) => {
    //console.log('onMessage');
    const { data } = byteString;
    //console.log(JSON.parse(data));
    const tmp = JSON.parse(data);
    const task = tmp.type;
    const payload = tmp.payload;
    //console.log('task: ' + task);
    //console.log('payload:' + payload);
    //console.log(ws.box);

    // if (ws.box !== '' && chatBoxes[ws.box]) chatBoxes[ws.box].delete(ws);
    switch (task) {
      case 'CHAT': {
        if (ws.box !== '' && chatBoxes[ws.box]) chatBoxes[ws.box].delete(ws);

        const { name, to } = payload;
        //console.log('Chat' + name, to);
        const chatBoxName = makeName(name, to);
        if (!chatBoxes[chatBoxName]) chatBoxes[chatBoxName] = new Set();
        chatBoxes[chatBoxName].add(ws);

        let sdUser = await UserModel.findOne({ name });
        let rxUser = await UserModel.findOne({ name: to });

        ws.box = chatBoxName;
        if (!sdUser) {
          sdUser = await new UserModel({ name }).save();
        }
        if (!rxUser) {
          rxUser = await new UserModel({ name: to }).save();
        }
        const chatbox = await validateChatBox(chatBoxName, [sdUser, rxUser]);

        //console.log(chatbox);
        const reply = [];
        chatbox.messages.map((msg) => {
          const sender = msg.sender.name;
          const body = msg.body;
          //console.log(sender, body);
          reply.push({ sender: sender, body: body });
          //sendData(['CHAT', {sender: sender, body: body}], ws)
        });
        //reply.push({ sender: 'Kan', body: 'Test Message' });
        sendData(['CHAT', reply], ws);
        break;
      }
      case 'MESSAGE': {
        // Save payload to DB
        const { name, to, body } = payload;
        //console.log(name, to, body);
        const boxname = makeName(name, to);
        let box = await ChatBoxModel.findOne({ name: boxname });
        var flip = true;
        if (!box) {
          boxname = makeName(to, name);
          box = await ChatBoxModel.findOne({ name: boxname });
          flip = false;
        }
        //validateUser(name, to);
        let user = await UserModel.findOne({ name });
        const message = new MessageModel({
          chatBox: box,
          sender: user,
          body: body,
        });
        await message.save();
        //console.log('Message!');
        const addMessage = [...box.messages, message];
        const updateMessage = await ChatBoxModel.updateOne(
          { name: box.name },
          { $set: { messages: addMessage } }
        );
        broadcastMessage(wss, ['MESSAGE', payload], {
          type: 'success',
          msg: 'Message sent.',
        });
        // broadcastMessage(wss, ['MESSAGE', [payload]], {
        //   type: 'success',
        //   msg: 'Message sent.',
        // });
        break;
      }
      case 'CLEAR': {
        break;
      }
      default:
        break;
    }
  },
};
