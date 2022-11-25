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

const ChatProvider = (props) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({});
  const [signedIn, setSignedIn] = useState(false);
  const [me, setMe] = useState(savedMe || '');
  // client.addEventListener('error', (event) => {
  //   console.log('WebSocket error: ', event);
  // });
  const sendData = async (data) => {
    await client.send(JSON.stringify(data));
  };
  client.onmessage = (byteString) => {
    const { data } = byteString;
    const [task, payload] = JSON.parse(data);
    switch (task) {
      case 'CHAT': {
        setMessages(payload);
        break;
      }
      case 'MESSAGE': {
        setMessages(() => [...messages, payload]);
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
  const sendMessage = (name, to, body) => {
    if (!name || !to || !body) throw new Error('Name or to required.');
    //setMessages([...messages, payload]);
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
      }}
      {...props}
    />
  );
};

const useChat = () => useContext(ChatContext);

export { ChatProvider, useChat };
