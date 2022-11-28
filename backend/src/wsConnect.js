const UserModel = require('./models/user');
const MessageModel = require('./models/message');
const ChatBoxModel = require('./models/chatbox');
const makeName = (name, to) => {
  return [name, to].sort().join('_');
};

const validateUser = async (name) => {
  console.log('Finding...' + name);
  let existing = await UserModel.findOne({ name });
  try {
    if (existing) {
      console.log('user exists');
      console.log(existing);
    } else {
      const newUser = await new UserModel({ name });
      console.log('adding', newUser);
      newUser.save();
    }
  } catch (e) {
    console.log(e);
  }
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
  onMessage: (wss, ws) => async (byteString) => {
    console.log('onMessage');
    const { data } = byteString;
    console.log(JSON.parse(data));
    const tmp = JSON.parse(data);
    const task = tmp.type;
    const payload = tmp.payload;
    console.log('task: ' + task);
    console.log('payload:' + payload);
    console.log(ws.box);

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
        let rxUser = await UserModel.findOne({ to });

        ws.box = chatBoxName;
        var exists = true;
        var exists2 = true;
        var newUser;
        var newUser2;
        if (!sdUser) {
          newUser = await new UserModel({ name });
          newUser.save();
          exists = false;
        }
        if (!rxUser) {
          newUser2 = await new UserModel({ name: to });
          newUser2.save();
          exists2 = false;
        }
        var chatbox;
        if (exists && exists2)
          chatbox = await validateChatBox(chatBoxName, [sdUser, rxUser]);
        else if (!exists && exists2)
          chatbox = await validateChatBox(chatBoxName, [newUser, rxUser]);
        else if (exists && !exists2)
          chatbox = await validateChatBox(chatBoxName, [sdUser, newUser2]);
        else if (!exists && !exists2)
          chatbox = await validateChatBox(chatBoxName, [newUser, newUser2]);

        //console.log(chatbox);
        const reply = [];
        chatbox.messages.map((msg) => {
          const sender = msg.sender.name;
          const body = msg.body;
          //console.log(sender, body);
          reply.push({ sender: sender, body: body });
          //sendData(['CHAT', {sender: sender, body: body}], ws)
        });
        reply.push({ sender: 'Kan', body: 'Test Message' });
        sendData(['CHAT', reply], ws);
        break;
      }
      case 'MESSAGE': {
        // Save payload to DB
        const { name, to, body } = payload;
        console.log(name, to, body);
        //validateUser(name, to);
        console.log('nameModel');
        // const message = new MessageModel(
        //   validateChatBox(name, to),
        //   validateUser(name),
        //   body
        // );
        // try {
        //   await message.save();
        // } catch (e) {
        //   throw new Error('Message DB save error: ' + e);
        // }
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
