import { useState, useEffect, useContext, createContext } from 'react';
import { message } from 'antd';

const LOCALSTORAGE_KEY = 'save-me';
const savedMe = localStorage.getItem(LOCALSTORAGE_KEY);

const ChatContext = createContext({
  status: {},
  me: '',
  signedIn: false,
  messages: [],
  sendMessage: () => {},
  clearMessages: () => {},
});
const client = new WebSocket('ws://localhost:4000/');
const ChatProvider = (props) => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({});
  const [signedIn, setSignedIn] = useState(false);
  const [me, setMe] = useState(savedMe || '');
  client.addEventListener('error', (event) => {
    console.log('WebSocket error: ', event);
  });
  const sendData = async (data) => {
    client.send(JSON.stringify(data));
  };
  client.onmessage = (byteString) => {
    const { data } = byteString;
    const [task, payload] = JSON.parse(data);
    switch (task) {
      case 'init': {
        setMessages(payload);
        break;
      }
      case 'output': {
        setMessages(() => [...messages, ...payload]);
        break;
      }
      case 'status': {
        setStatus(payload);
        break;
      }
      case 'cleared': {
        setMessages([]);
        break;
      }
      default:
        break;
    }
  };
  const sendMessage = (payload) => {
    //setMessages([...messages, payload]);
    sendData(['input', payload]);
    console.log(payload);
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
        sendMessage,
        clearMessages,
        signedIn,
        displayStatus,
        setSignedIn,
        me,
        setMe,
      }}
      {...props}
    />
  );
};

const useChat = () => useContext(ChatContext);

export { ChatProvider, useChat };
