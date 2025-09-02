import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginWithEmail, loginWithGoogle, loginWithApple } from '../services/auth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      await loginWithEmail(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to log in', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to log in with Google', error);
    }
  };

  const handleAppleLogin = async () => {
    try {
      await loginWithApple();
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to log in with Apple', error);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleEmailLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login with Email</button>
      </form>
      <button onClick={handleGoogleLogin}>Login with Google</button>
      <button onClick={handleAppleLogin}>Login with Apple</button>
    </div>
  );
};

export default Login;
