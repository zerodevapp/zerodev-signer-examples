import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePrivy } from '@privy-io/react-auth';

function Login() {
  const { ready, authenticated, login, logout } = usePrivy();
  const navigate = useNavigate()

  useEffect(() => {
    if (ready && authenticated) {
      navigate("/");
    }
  }, [ready, authenticated, navigate]);

  return (
    <div className="App">
      <div>
        Authenticated: {authenticated.toString()}
        <br />
        {authenticated && <button onClick={() => logout()}>logout</button>}
        {!authenticated && <button onClick={() => login()}>login</button>}
      </div>
    </div>
  );
}

export default Login;
