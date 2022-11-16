import { useState } from 'react';
const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({});
  const client = new WebSocket('ws://localhost:4000/');
  client.addEventListener('error', (event) => {
    console.log('WebSocket error: ', event);
  });
  const sendData = async (data) => {
    client.addEventListener('open', () => {
      client.send(JSON.stringify(data));
    });
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
      default:
        break;
    }
  };
  const sendMessage = (payload) => {
    //setMessages([...messages, payload]);
    sendData(['input', payload]);
    console.log(payload);
  };
  return {
    status,
    messages,
    sendMessage,
  };
};
export default useChat;
