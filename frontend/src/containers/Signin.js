import React from 'react';
import { Title } from '../components/Title';
import { Login } from '../components/Login';
import { useChat } from '../hooks/useChat';

export const Signin = ({ me }) => {
  const { setMe, setSignedIn, displayStatus } = useChat();
  const handleLogin = (name) => {
    if (!name)
      displayStatus({
        type: 'error',
        msg: 'Missing user name',
      });
    else setSignedIn(true);
  };
  return (
    <>
      <Title />
      <Login me={me} setName={setMe} onLogin={handleLogin} />
    </>
  );
};
