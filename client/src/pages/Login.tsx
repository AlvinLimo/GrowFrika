import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/users/login', {
        emailorusername: emailOrUsername,
        password: password,
      });

      const {token, user} = res.data

      localStorage.clear()
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('userId', user.id)

      console.log('Login successful:', res.data);
      setMessage('Login successful!');
      navigate(`/home/${user.id}`, { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);
        setMessage(error.response?.data?.message || 'Login failed');
      } else {
        console.error('Unexpected error:', error);
        setMessage('An unexpected error occurred');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>

      <input
        type="text"
        placeholder="Email or Username"
        value={emailOrUsername}
        onChange={(e) => setEmailOrUsername(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleLogin}
        className="w-full bg-blue-600 text-black font-semibold py-2 rounded hover:bg-blue-700 transition"
      >
        Login
      </button>

      {message && (
        <div className="mt-4 text-center text-red-600 font-medium">{message}</div>
      )}

      <hr className="my-6" />

      <div className="text-center">
        <button
          onClick={() => window.location.href = 'http://localhost:5000/auth/google'}
          className="w-full bg-red-500 text-black font-semibold py-2 rounded hover:bg-red-600 transition"
        >
          Login with Google
        </button>
      </div>
    </div>
  );
}

export default Login;
