import React from 'react';
import { Tabs, Input, Tag } from 'antd';
import { useChat } from '../hooks/useChat';
import { useState, useEffect, useRef } from 'react';
import { Title } from '../components/Title';
import Message from '../components/Message';
import styled from 'styled-components';
import ChatModal from '../components/ChatModal';
const ChatBoxesWrapper = styled(Tabs)`
  width: 100%;
  height: 100%;
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
  const { me, messages, sendMessage, displayStatus } = useChat();
  const [chatBoxes, setChatBoxes] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [msg, setMsg] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [username, setUsername] = useState('');

  const msgFooter = useRef(null);
  const displayChat = (chat) => {
    chat.length === 0 ? (
      <p style={{ color: '#ccc' }}> No messages... </p>
    ) : (
      <ChatBoxWrapper>
        {chat.map(({ name, body }, i) => (
          <Message name={name} isMe={name === me} message={body} key={i} />
        ))}
        <FootRef ref={msgFooter} />
      </ChatBoxWrapper>
    );
  };
  const extractChat = (friend) => {
    return displayChat(
      messages.filter(({ name, body }) => name === friend || name === me)
    );
  };
  const createChatBox = (friend) => {
    if (chatBoxes.some(({ key }) => key === friend)) {
      throw new Error(friend + "'s chat box has already opened.");
    }
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
    scrollToBottom();
    setMsgSent(false);
  }, [msgSent]);

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
            extractChat(name);
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
          if (!msg || !username) {
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
          sendMessage({ name: username, body: msg });
          setMsg('');
          setMsgSent(true);
        }}></Input.Search>
    </>
  );
};
