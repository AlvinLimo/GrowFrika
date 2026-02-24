/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ProfileModal.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, User, Mail, Lock, Shield, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  userId: string;
}

interface UserData {
  id: string;
  username: string;
  email: string;
  isGoogleUser: boolean;
  hasPassword: boolean;
  isVerified: boolean;
  profilePicture?: string;
}

function ProfileModal({ isOpen, onClose, darkMode, userId }: ProfileModalProps) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Active tab
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserData();
    }
  }, [isOpen, userId]);

  const fetchUserData = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await axios.get(`${import.meta.env.VITE_SERVER_URL}/users/getbyID/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data);
      setUsername(response.data.username);
      setEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching user:', error);
      setMessage('Failed to load user data');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    const token = localStorage.getItem('token');

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_SERVER_URL}/users/update/${userId}`,
        { username, email },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(response.data.user);
      setMessage('Profile updated successfully!');
      setMessageType('success');

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error: any) {
      console.error('Error updating profile:', error);
      setMessage(error.response?.data?.message || 'Failed to update profile');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    if (newPassword !== confirmPassword) {
      setMessage("Passwords don't match");
      setMessageType('error');
      setSaving(false);
      return;
    }

    if (newPassword.length < 6) {
      setMessage('Password must be at least 6 characters');
      setMessageType('error');
      setSaving(false);
      return;
    }

    const token = localStorage.getItem('token');

    try {
      // If user has a password, use update endpoint
      if (user?.hasPassword) {
        await axios.patch(
          `${import.meta.env.VITE_SERVER_URL}/users/update/${userId}`,
          { currentPassword, newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        // If Google user setting first password, use set-password endpoint
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/users/set-password/${userId}`,
          { password: newPassword },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setMessage('Password updated successfully!');
      setMessageType('success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Refresh user data
      await fetchUserData();
    } catch (error: any) {
      console.error('Error changing password:', error);
      setMessage(error.response?.data?.message || 'Failed to change password');
      setMessageType('error');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-blur bg-opacity-100 animate-fade-in">
      <div
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl animate-slide-up ${
          darkMode ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}
        >
          <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Profile Settings
          </h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              darkMode
                ? 'hover:bg-gray-700 text-gray-400'
                : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div
          className={`flex border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
        >
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'profile'
                ? darkMode
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-green-600 border-b-2 border-green-600'
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <User className="inline-block w-5 h-5 mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'security'
                ? darkMode
                  ? 'text-green-400 border-b-2 border-green-400'
                  : 'text-green-600 border-b-2 border-green-600'
                : darkMode
                ? 'text-gray-400 hover:text-gray-300'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Shield className="inline-block w-5 h-5 mr-2" />
            Security
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
            </div>
          ) : (
            <>
              {/* Message */}
              {message && (
                <div
                  className={`mb-6 p-4 rounded-lg flex items-start gap-3 ${
                    messageType === 'success'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-red-50 border border-red-200'
                  }`}
                >
                  {messageType === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  )}
                  <p
                    className={`text-sm ${
                      messageType === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}
                  >
                    {message}
                  </p>
                </div>
              )}

              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  {/* Account Type Badge */}
                  <div className="flex items-center gap-3">
                    {user?.isGoogleUser && (
                      <span className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 rounded-full">
                        Google Account
                      </span>
                    )}
                    {user?.isVerified && (
                      <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {/* Username */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Username
                    </label>
                    <div className="relative">
                      <User
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                        } focus:ring-2 focus:border-transparent outline-none`}
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                        } focus:ring-2 focus:border-transparent outline-none`}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </form>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  {/* Info Message */}
                  {user?.isGoogleUser && !user?.hasPassword && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Set a password to enable login with email and password in addition to
                        Google.
                      </p>
                    </div>
                  )}

                  {/* Current Password (only if user already has a password) */}
                  {user?.hasPassword && (
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${
                          darkMode ? 'text-gray-300' : 'text-gray-700'
                        }`}
                      >
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock
                          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                            darkMode ? 'text-gray-500' : 'text-gray-400'
                          }`}
                        />
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          required
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                            darkMode
                              ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                              : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                          } focus:ring-2 focus:border-transparent outline-none`}
                        />
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      {user?.hasPassword ? 'New Password' : 'Password'}
                    </label>
                    <div className="relative">
                      <Lock
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                        } focus:ring-2 focus:border-transparent outline-none`}
                      />
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label
                      className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                          darkMode ? 'text-gray-500' : 'text-gray-400'
                        }`}
                      />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className={`w-full pl-10 pr-4 py-3 rounded-lg border transition-colors ${
                          darkMode
                            ? 'bg-gray-700 border-gray-600 text-white focus:ring-green-500'
                            : 'bg-white border-gray-300 text-gray-900 focus:ring-green-500'
                        } focus:ring-2 focus:border-transparent outline-none`}
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {user?.hasPassword ? 'Updating...' : 'Setting...'}
                      </>
                    ) : user?.hasPassword ? (
                      'Change Password'
                    ) : (
                      'Set Password'
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }

        .bg-blur {
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default ProfileModal;