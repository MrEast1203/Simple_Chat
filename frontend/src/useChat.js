import { useState } from 'react';
const useChat = () => {
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState({});
  const client = new WebSocket('ws://localhost:4000');
  const sendData = async (data) => {
    await client.send(JSON.stringify(data));
  };
  const sendMessage = (msg) => {
    setMessages([...messages, msg]);
    setStatus({
      type: 'success',
      msg: 'Message sent.',
    });
    console.log(msg);
  };
  return {
    status,
    messages,
    sendMessage,
  };
};
export default useChat;
