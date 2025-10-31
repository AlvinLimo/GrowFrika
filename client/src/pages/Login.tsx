import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const res = await axios.post('http://localhost:5000/users/login', {
        emailorusername: emailOrUsername,
        password: password,
      });

      const { token, user } = res.data;

      if (user.isGoogleUser && !user.hasPassword) {
        setMessage(
          "It seems you signed up with Google and haven't set a password yet. Please login with Google first, then set your password."
        );
        setIsLoading(false);
        return;
      }

      localStorage.clear();
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.id);

      console.log('Login successful:', res.data);
      navigate('/home', { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Login error:', error.response?.data || error.message);

        if (error.response?.data?.reason === 'GOOGLE_ACCOUNT_NO_PASSWORD') {
          setMessage(
            "This account was created with Google login. Please sign in with Google first and set your password."
          );
        } else {
          setMessage(error.response?.data?.message || 'Login failed. Please check your credentials.');
        }
      } else {
        console.error('Unexpected error:', error);
        setMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/auth/google';
  };

  return (
    <div className="w-full ">
      {/* Login Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to continue to GrowFrika</p>
        </div>

        {/* Error Message */}
        {message && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email/Username Input */}
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-2">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="emailOrUsername"
                type="text"
                placeholder="Enter your email or username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="text-black w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-black w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-300 hover:text-gray-500 transition-colors bg-transparent"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4 bg-transparent " />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-green-600 hover:text-green-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500 font-medium">Or continue with</span>
          </div>
        </div>

        {/* Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-200 font-semibold py-3 rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center gap-3"
        >
          <FcGoogle className="w-6 h-6" />
          Sign in with Google
        </button>

        {/* Sign Up Link */}
        <div className="text-center pt-4 border-t border-gray-200">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-green-600 hover:text-green-700 font-semibold transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Footer Note */}
      <p className="text-center text-sm text-gray-500 mt-6">
        By signing in, you agree to our{' '}
        <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" className="text-green-600 hover:text-green-700 transition-colors">
          Privacy Policy
        </a>
      </p>
    </div>
  );
}

export default Login;