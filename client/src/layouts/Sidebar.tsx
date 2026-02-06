import { useLocation, useNavigate } from "react-router-dom";
import { IoClose } from "react-icons/io5";
import { 
  MessageSquare,
  Plus,
  Clock,
  Trash2,
  ChevronDown,
  ChevronRight
} from "lucide-react";
import { useState, useEffect } from "react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  darkMode: boolean;
}

interface Conversation {
  convo_id: string;
  title: string;
  last_message_at: string;
  category?: string;
  message_count?: number;
}

const API_BASE_URL = "http://localhost:5000/api";

// Helper function to get userId from token
const getUserIdFromToken = (token: string): string | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    const decoded = JSON.parse(jsonPayload);
    return decoded?.userData?.user_id || decoded?.user_id || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

function Sidebar({ isOpen, setIsOpen, darkMode }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [showChats, setShowChats] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get userId
  const getUserId = (): string | null => {
    // First try localStorage
    let userId = localStorage.getItem("userId");
    
    // If not found, try to extract from token
    if (!userId) {
      const token = localStorage.getItem("token");
      if (token) {
        userId = getUserIdFromToken(token);
        if (userId) {
          localStorage.setItem("userId", userId);
        }
      }
    }

    // Last resort: try user object
    if (!userId) {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          userId = user.user_id || user.id;
          if (userId) {
            localStorage.setItem("userId", userId);
          }
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }

    return userId;
  };

  // Load conversations when sidebar opens
  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  const loadConversations = async () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setError('No authentication token found');
      return;
    }

    try {
      setLoadingChats(true);
      setError(null);

      const res = await fetch(`${API_BASE_URL}/ml/conversations?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setConversations(data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setError(error instanceof Error ? error.message : 'Failed to load conversations');
    } finally {
      setLoadingChats(false);
    }
  };

  const handleNewChat = () => {
    const userId = getUserId();
    if (userId) {
      // Generate new conversation ID
      const newConvoId = crypto.randomUUID();
      navigate(`/home/${newConvoId}`);
    } else {
      navigate('/home');
    }
    setIsOpen(false);
  };

  const handleChatClick = (convoId: string) => {
    navigate(`/home/${convoId}`);
    setIsOpen(false);
  };

  const handleDeleteChat = async (e: React.MouseEvent, convoId: string) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      setDeletingId(convoId);
      const res = await fetch(`${API_BASE_URL}/ml/conversation/${convoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete conversation');
      }

      // Remove from list
      setConversations(prev => prev.filter(c => c.convo_id !== convoId));
      
      // If currently viewing this conversation, redirect to home
      if (location.pathname.includes(convoId)) {
        navigate('/home');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Failed to delete conversation');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Backdrop - Only show on mobile screens */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full shadow-xl z-40 transition-all duration-300 transform overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          darkMode 
            ? 'bg-gray-800 border-r border-gray-700' 
            : 'bg-white border-r border-gray-200'
        }`}
        style={{ width: "300px" }}
      >
        {/* Header - Only show when sidebar is open */}
        {isOpen && (
          <div className={`flex justify-between items-center p-4 border-b sticky top-0 z-10 transition-colors duration-200 ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <h2 className={`text-xl font-bold transition-colors duration-200 ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Menu
            </h2>
            <button
              className={`p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                darkMode 
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setIsOpen(false)}
            >
              <IoClose size={22} />
            </button>
          </div>
        )}

        {/* Chat History Section */}
        {isOpen && (
          <div className="px-4 pb-4">
            <div className={`border-t pt-4 ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              {/* Section Header */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={() => setShowChats(!showChats)}
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
                    darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {showChats ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                  <MessageSquare size={16} />
                  <span>Recent Chats</span>
                </button>
                
                <button
                  onClick={handleNewChat}
                  className={`p-1.5 rounded-lg transition-colors ${
                    darkMode 
                      ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  title="New Chat"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Chat List */}
              {showChats && (
                <div className="space-y-1">
                  {error && (
                    <div className={`text-center py-4 text-sm ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`}>
                      {error}
                      <button
                        onClick={loadConversations}
                        className={`block mx-auto mt-2 text-xs underline ${
                          darkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}
                      >
                        Retry
                      </button>
                    </div>
                  )}
                  
                  {loadingChats ? (
                    <div className={`text-center py-4 text-sm ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      Loading chats...
                    </div>
                  ) : conversations.length === 0 && !error ? (
                    <div className={`text-center py-4 text-sm ${
                      darkMode ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      No conversations yet
                    </div>
                  ) : (
                    conversations.map((conv) => {
                      const isActive = location.pathname.includes(conv.convo_id);
                      
                      return (
                        <div
                          key={conv.convo_id}
                          onClick={() => handleChatClick(conv.convo_id)}
                          className={`group relative flex items-start gap-2 p-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
                            isActive
                              ? darkMode
                                ? 'bg-green-600/20 border border-green-600/50'
                                : 'bg-green-50 border border-green-200'
                              : darkMode
                                ? 'hover:bg-gray-700/50'
                                : 'hover:bg-gray-50'
                          }`}
                        >
                          <MessageSquare 
                            size={14} 
                            className={`mt-1 flex-shrink-0 ${
                              isActive
                                ? darkMode ? 'text-green-400' : 'text-green-600'
                                : darkMode ? 'text-gray-500' : 'text-gray-400'
                            }`}
                          />
                          
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium truncate ${
                              isActive
                                ? darkMode ? 'text-green-300' : 'text-green-700'
                                : darkMode ? 'text-gray-200' : 'text-gray-900'
                            }`}>
                              {conv.title}
                            </p>
                            
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <Clock size={10} className={darkMode ? 'text-gray-500' : 'text-gray-400'} />
                              <span className={`text-xs ${
                                darkMode ? 'text-gray-500' : 'text-gray-500'
                              }`}>
                                {formatDate(conv.last_message_at)}
                              </span>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={(e) => handleDeleteChat(e, conv.convo_id)}
                            disabled={deletingId === conv.convo_id}
                            className={`opacity-0 group-hover:opacity-100 p-1.5 rounded transition-all ${
                              darkMode
                                ? 'text-gray-500 hover:text-red-400 hover:bg-gray-700'
                                : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            } ${deletingId === conv.convo_id ? 'opacity-50' : ''}`}
                            title="Delete conversation"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      );
                    })
                  )}

                  {/* Show More Button (if there are many conversations) */}
                  {conversations.length >= 20 && (
                    <button
                      className={`w-full text-center text-sm py-2 rounded-lg transition-colors ${
                        darkMode
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => {/* TODO: Load more conversations */}}
                    >
                      View all conversations
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer - Only show when sidebar is open */}
        {isOpen && (
          <div className={`sticky bottom-0 p-4 border-t transition-colors duration-200 ${
            darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          }`}>
            <p className={`text-sm text-center transition-colors duration-200 ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            }`}>
              GrowFrika v1.0
            </p>
          </div>
        )}
      </div>
    </>
  );
}

export default Sidebar;