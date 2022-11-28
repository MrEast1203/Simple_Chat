import React from 'react';
import { Tabs, Input } from 'antd';
import { useChat } from '../hooks/useChat';
import { useState, useEffect, useRef } from 'react';
import { Title } from '../components/Title';
import Message from '../components/Message';
import styled from 'styled-components';
import ChatModal from '../components/ChatModal';
const ChatBoxesWrapper = styled(Tabs)`
  width: 100%;
  height: 300px;
  background: #eeeeee52;
  border-radius: 10px;
  margin: 20px;
  padding: 20px;
`;
const ChatBoxWrapper = styled.div`
  height: calc(240px-36px);
  display: flex;
  flex-direction: column;
  overflow: auto;
`;
const FootRef = styled.div`
  height: 20px;
`;
export const ChatRoom = () => {
  const { me, messages, sendMessage, displayStatus, startChat, test, setTest } =
    useChat();
  const [chatBoxes, setChatBoxes] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [msg, setMsg] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [flip, setFlip] = useState(false);

  const msgFooter = useRef(null);
  const displayChat = (chat) => {
    return chat.length === 0 ? (
      <p style={{ color: '#ccc' }}> No messages... </p>
    ) : (
      <ChatBoxWrapper>
        {chat.map(({ sender, body }, i) => (
          <Message name={sender} isMe={sender === me} message={body} key={i} />
        ))}
        <FootRef ref={msgFooter} />
      </ChatBoxWrapper>
    );
  };
  const extractChat = (friend) => {
    console.log(me + friend);
    console.log('extract', test);
    return displayChat(messages);
  };
  const createChatBox = (friend) => {
    if (chatBoxes.some(({ key }) => key === friend)) {
      throw new Error(friend + "'s chat box has already opened.");
    }
    console.log('creating chatbox');
    startChat(me, friend);
    const chat = extractChat(friend);
    setChatBoxes([
      ...chatBoxes,
      { label: friend, children: chat, key: friend },
    ]);
    setMsgSent(true);
    return friend;
  };
  const removeChatBox = (targetKey, activeKey) => {
    const index = chatBoxes.findIndex(({ key }) => key === activeKey);
    const newChatBoxes = chatBoxes.filter(({ key }) => key !== targetKey);
    setChatBoxes(newChatBoxes);

    return activeKey
      ? activeKey === targetKey
        ? index === 0
          ? ''
          : chatBoxes[index - 1].key
        : activeKey
      : '';
  };
  const scrollToBottom = () => {
    msgFooter.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  useEffect(() => {
    //scrollToBottom();
    setMsgSent(false);
  }, [msgSent]);
  const testref = useRef(true);
  const testref2 = useRef(true);
  useEffect(() => {
    if (testref.current) {
      testref.current = false;
      return;
    }
    if (testref2.current) {
      testref2.current = false;
      return;
    }
    console.log(messages);
    const tmp = chatBoxes.find(({ key }) => key === activeKey);
    tmp.children = displayChat(messages);
    setFlip(true);
  }, [messages]);

  useEffect(() => {
    setFlip(false);
  }, [flip]);

  // useEffect(() => {
  //   const chat = extractChat(activeKey);
  //   setChatBoxes([
  //     ...chatBoxes,
  //     { label: activeKey, children: chat, key: activeKey },
  //   ]);
  // }, [messages]);
  return (
    <>
      <Title name={me} />
      <>
        <ChatBoxesWrapper
          tabBarStyle={{ height: '36px' }}
          type="editable-card"
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            startChat(me, key);
            extractChat(key);
          }}
          onEdit={(targetKey, action) => {
            if (action === 'add') setModalOpen(true);
            else if (action === 'remove') {
              setActiveKey(removeChatBox(targetKey, activeKey));
            }
          }}
          items={chatBoxes}
        />
        <ChatModal
          open={modalOpen}
          onCreate={({ name }) => {
            setActiveKey(createChatBox(name));
            //extractChat(name);
            setModalOpen(false);
          }}
          onCancel={() => {
            setModalOpen(false);
          }}
        />
      </>
      <Input.Search
        ref={msgFooter}
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        enterButton="Send"
        placeholder="Type a message here..."
        onSearch={(msg) => {
          if (!msg) {
            displayStatus({
              type: 'error',
              msg: 'Please enter a username and a message body.',
            });
            return;
          } else if (activeKey === '') {
            displayStatus({
              type: 'error',
              msg: 'Please add chatbox first.',
            });
            setMsg('');
            return;
          }
          {
            console.log('me:' + me + 'act:' + activeKey + 'msg' + msg);
          }
          sendMessage({ name: me, to: activeKey, body: msg });
          setMsg('');
          setMsgSent(true);
        }}></Input.Search>
    </>
  );
};
