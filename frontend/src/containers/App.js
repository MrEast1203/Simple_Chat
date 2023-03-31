import '../App.css';
import { useChat } from '../hooks/useChat';
import { useEffect } from 'react';
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
  const { status, me, signedIn, displayStatus } = useChat();
  useEffect(() => {
    displayStatus(status);
  }, [status]);
  return <Wrapper>{signedIn ? <ChatRoom /> : <Signin me={me} />}</Wrapper>;
}

export default App;
