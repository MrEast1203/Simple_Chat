import { useState, useEffect, useContext, createContext } from 'react';
import { message } from 'antd';

const LOCALSTORAGE_KEY = 'save-me';
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

const ChatContext = createContext({
  status: {},
  me: '',
  signedIn: false,
  messages: [],
  startChat: () => {},
  sendMessage: () => {},
  clearMessages: () => {},
});
const client = new WebSocket('ws://localhost:4000/');
client.onopen = () => console.log('Backend socket server connected!');

//console.log('client', client);

const ChatProvider = (props) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({});
  const [signedIn, setSignedIn] = useState(false);
  const [me, setMe] = useState(savedMe || '');
  const [test, setTest] = useState(false);
  // client.addEventListener('error', (event) => {
  //   console.log('WebSocket error: ', event);
  // });
  const sendData = async (data) => {
    client.send(JSON.stringify(data));
  };
  client.onmessage = (byteString) => {
    const { data } = byteString;
    const [task, payload] = JSON.parse(data);
    switch (task) {
      case 'CHAT': {
        //console.log('CHAT', payload);
        setMessages(payload);
        setTest(true);
        //console.log('messages in useChat', messages);
        //console.log('test', test);
        //console.error('Do CHAT!');
        break;
      }
      case 'MESSAGE': {
        setMessages(() => [
          ...messages,
          { sender: payload.name, body: payload.body },
        ]);
        //console.error('Do MESSAGE!');
        break;
      }
      case 'status': {
        setStatus(payload);
        break;
      }
      default:
        break;
    }
  };
  const startChat = (name, to) => {
    if (!name || !to) throw new Error('Name or to required.');

    sendData({
      type: 'CHAT',
      payload: { name, to },
    });
  };
  const sendMessage = (payload) => {
    const { name, to, body } = payload;
    if (!name || !to || !body) throw new Error('Name or to required.');
    //setMessages([...messages, payload]);
    //console.log(name + to + body);
    sendData({
      type: 'MESSAGE',
      payload: { name, to, body },
    });
  };

  const clearMessages = () => {
    sendData(['clear']);
  };

  const displayStatus = (s) => {
    if (s.msg) {
      const { type, msg } = s;
      const content = {
        content: msg,
        duration: 0.5,
      };
      switch (type) {
        case 'success':
          message.success(content);
          break;
        case 'error':
        default:
          message.error(content);
          break;
      }
    }
  };
  useEffect(() => {
    if (signedIn) {
      localStorage.setItem(LOCALSTORAGE_KEY, me);
    }
  }, [me, signedIn]);
  return (
    <ChatContext.Provider
      value={{
        status,
        messages,
        me,
        signedIn,
        sendMessage,
        clearMessages,
        displayStatus,
        setSignedIn,
        setMe,
        startChat,
        test,
        setTest,
      }}
      {...props}
    />
  );
};

const useChat = () => useContext(ChatContext);

export { ChatProvider, useChat };
