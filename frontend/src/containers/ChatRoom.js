import React from 'react';
import { Tabs, Input } from 'antd';
import { useChat } from '../hooks/useChat';
import { useState, useEffect, useRef } from 'react';
import { Title } from '../components/Title';
import Message from '../components/Message';
import styled from 'styled-components';
import ChatModal from '../components/ChatModal';

const ChatBoxesBase = styled(Tabs)`
  width: 100%;
  height: 300px;
  background: #eeeeee52;
  border-radius: 10px;
  margin: 20px;
  padding: 20px;
`;

const ChatBoxWrapper = styled.div`
  height: calc(240px - 36px);
  overflow: auto;
  display: flex;
  flex-direction: column;
`;
const FootRef = styled.div`
  height: 20px;
`;

const ChatBoxesWrapper = ({
  chatBoxes,
  onChange,
  onEdit,
  activeKey,
  messages,
  me,
}) => {
  const msgFooter = useRef(null);
  //console.log('messages', messages);
  messages = messages.filter(
    ({ sender, body }) => sender === activeKey || sender === me
  );
  const items = (chatBoxes ?? []).map((box) => {
    return {
      ...box,
      children: (
        <ChatBoxWrapper>
          {messages.map(({ sender, body }, i) => (
            <Message
              name={sender}
              isMe={sender === me}
              message={body}
              key={i}
            />
          ))}
          <FootRef ref={msgFooter} id="footer-ref"></FootRef>
        </ChatBoxWrapper>
      ),
    };
  });

  useEffect(() => {
    msgFooter.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [messages]);

  return (
    <ChatBoxesBase
      tabBarStyle={{ height: '36px' }}
      type="editable-card"
      onChange={onChange}
      onEdit={onEdit}
      activeKey={activeKey}
      items={items}></ChatBoxesBase>
  );
};

export const ChatRoom = () => {
  const { me, messages, sendMessage, displayStatus, startChat, test, setTest } =
    useChat();
  const [chatBoxes, setChatBoxes] = useState([]);
  const [activeKey, setActiveKey] = useState('');
  const [msg, setMsg] = useState('');
  const [msgSent, setMsgSent] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const msgFooter = useRef(null);
  const displayChat = (chat) => {
    return chat.length === 0 ? (
      <p style={{ color: '#ccc' }}> No messages... </p>
    ) : (
      <ChatBoxWrapper>
        {chat.map(({ sender, body }, i) => (
          <Message name={sender} isMe={sender === me} message={body} key={i} />
        ))}
        <div ref={msgFooter} id="footer-ref"></div>
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

  // useEffect(() => {
  //   msgFooter.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  //   console.log("scroll");
  //   setMsgSent(false);
  // }, [msgSent, msgFooter.current]);

  return (
    <>
      <Title name={me} />
      <>
        <ChatBoxesWrapper
          activeKey={activeKey}
          onChange={(key) => {
            setActiveKey(key);
            extractChat(key);
            startChat(me, key);
          }}
          onEdit={(targetKey, action) => {
            if (action === 'add') setModalOpen(true);
            else if (action === 'remove') {
              setActiveKey(removeChatBox(targetKey, activeKey));
            }
          }}
          items={chatBoxes}
          messages={messages}
          chatBoxes={chatBoxes}
          me={me}></ChatBoxesWrapper>
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
          sendMessage({ name: me, to: activeKey, body: msg });
          setMsg('');
          setMsgSent(true);
        }}></Input.Search>
    </>
  );
};
