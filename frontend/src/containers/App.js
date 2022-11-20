import '../App.css';
import { Button, Input, message, Tag } from 'antd';
import useChat from '../hooks/useChat';
import { useState, useEffect, useRef } from 'react';
import { ChatRoom } from './ChatRoom';
import { Signin } from './Signin';
import styled from 'styled-components';
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 500px;
  margin: auto;
`;

function App() {
  const { status, signedIn, displayStatus } = useChat();
  // useEffect(() => {
  //   displayStatus(status);
  // }, [status, displayStatus]);
  return <Wrapper>{signedIn ? <ChatRoom /> : <Signin />}</Wrapper>;
}

export default App;
