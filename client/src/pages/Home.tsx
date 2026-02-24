/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { Send, ImagePlus, Loader2, AlertCircle, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

interface ChatMessage {
  message_id?: string;
  sender: "user" | "bot";
  text?: string;
  image?: string;
  imageUrl?: string;
  messageClass?: string;
  isLoading?: boolean;
  created_at?: string;
  metadata?: any;
}

interface HomeProps {
  darkMode: boolean;
}

const API_BASE_URL = `${import.meta.env.VITE_SERVER_URL}/api`;

const Home: React.FC<HomeProps> = ({ darkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const navigate = useNavigate();
  const { convo_id } = useParams<{ convo_id?: string }>();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }
  }, [navigate]);

  // Load conversation if convo_id exists
  useEffect(() => {
    if (convo_id) {
      setConversationId(convo_id);
      loadConversation(convo_id);
    } else {
      // Reset state when no conversation ID
      setConversationId(null);
      setConversationTitle("");
      setMessages([]);
    }
  }, [convo_id]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return {
      'Authorization': `Bearer ${token}`
    };
  };

  const loadConversation = async (convoId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`${API_BASE_URL}/ml/conversations/${convoId}`, {
        headers: getAuthHeaders()
      });

      if (!res.ok) {
        if (res.status === 404) {
          setError("Conversation not found");
          navigate("/home");
          return;
        }
        throw new Error(`Failed to load conversation: ${res.statusText}`);
      }

      const data = await res.json();
            
      setConversationTitle(data.conversation.title);
      
      // Map messages from the database to chat messages
      const loadedMessages: ChatMessage[] = data.conversation.messages.map((msg: any) => ({
        message_id: msg.message_id,
        sender: msg.role === 'user' ? 'user' : 'bot',
        text: msg.content,
        imageUrl: msg.image_urls?.[0],
        created_at: msg.created_at,
        metadata: msg.metadata,
        messageClass: getMessageClass(msg.metadata, msg.role)
      }));
            
      setMessages(loadedMessages);
    } catch (error) {
      console.error('Error loading conversation:', error);
      setError(`Failed to load conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getMessageClass = (metadata: any, role: string) => {
    if (role !== 'assistant' || !metadata) {
      return darkMode
        ? "bg-gray-800 text-gray-100 border border-gray-700"
        : "bg-white text-gray-900 border border-gray-300";
    }

    const status = metadata.status;
    const confidence = metadata.confidence;

    if (status === "invalid_image") {
      return darkMode
        ? "bg-red-900/30 text-red-200 border border-red-700/50"
        : "bg-red-50 text-red-900 border border-red-300";
    } else if (status === "low_quality_prediction") {
      return darkMode
        ? "bg-yellow-900/30 text-yellow-200 border border-yellow-700/50"
        : "bg-yellow-50 text-yellow-900 border border-yellow-300";
    } else if (status === "success") {
      if (confidence > 0.8) {
        return darkMode
          ? "bg-green-900/30 text-green-200 border border-green-700/50"
          : "bg-green-50 text-green-900 border border-green-300";
      } else if (confidence > 0.5) {
        return darkMode
          ? "bg-blue-900/30 text-blue-200 border border-blue-700/50"
          : "bg-blue-50 text-blue-900 border border-blue-300";
      }
    }

    return darkMode
      ? "bg-gray-800 text-gray-100 border border-gray-700"
      : "bg-white text-gray-900 border border-gray-300";
  };

  const getStatusIcon = (metadata: any) => {
    if (!metadata) return null;

    const status = metadata.status;
    const confidence = metadata.confidence;

    if (status === "invalid_image") {
      return <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
    } else if (status === "low_quality_prediction") {
      return <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0" />;
    } else if (status === "success") {
      if (confidence > 0.8) {
        return <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />;
      } else if (confidence > 0.5) {
        return <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      }
    }

    return null;
  };

  const getStatusLabel = (metadata: any) => {
    if (!metadata) return null;

    const status = metadata.status;
    const confidence = metadata.confidence;

    if (status === "invalid_image") {
      return <span className="text-xs font-semibold text-red-600 dark:text-red-400">Invalid Image</span>;
    } else if (status === "low_quality_prediction") {
      return <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400">Low Confidence</span>;
    } else if (status === "success") {
      if (confidence > 0.8) {
        return <span className="text-xs font-semibold text-green-600 dark:text-green-400">High Confidence</span>;
      } else if (confidence > 0.5) {
        return <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">Moderate Confidence</span>;
      }
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError("Please select a valid image file");
        return;
      }

      setSelectedImage(file);
      setError(null);
    }
  };

// Update the handleImageUpload function - around line 273
const handleImageUpload = async () => {
  if (!selectedImage) return;

  setIsLoading(true);
  setError(null);

  const formData = new FormData();
  formData.append("image", selectedImage);

  // Create preview URL for immediate display
  const imagePreviewUrl = URL.createObjectURL(selectedImage);

  // Add user message with image immediately
  const tempUserMsg: ChatMessage = {
    sender: "user",
    image: imagePreviewUrl,
    text: "Analyzing image..."
  };
  setMessages((prev) => [...prev, tempUserMsg]);

  // Add loading indicator
  setMessages((prev) => [
    ...prev,
    { sender: "bot", text: "Analyzing your plant image...", isLoading: true },
  ]);

  try {
    const res = await fetch(`${API_BASE_URL}/ml/predict`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: formData,
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
    }

    const data = await res.json();
    
    console.log("🔍 Prediction response:", data); // Debug log

    // Set conversation ID from response
    const newConvoId = data.conversation?.convo_id;
    
    if (newConvoId) {
      setConversationId(newConvoId);
      
      // Navigate to the conversation URL if it's a new conversation
      if (!conversationId) {
        navigate(`/home/${newConvoId}`, { replace: true });
      }
    }

    // Set conversation title
    if (data.conversation?.title) {
      setConversationTitle(data.conversation.title);
    }

    // Extract the bot response text - check multiple possible locations
    const botResponseText = 
      data.assistantMessage?.content || 
      data.prediction?.llm_response || 
      data.prediction?.advice ||
      "Analysis complete. Ask me any questions!";

    console.log("📝 Bot response text:", botResponseText); // Debug log

    // Remove temporary messages and add real ones
    setMessages((prev) => {
      const filtered = prev.filter((msg) => !msg.isLoading);
      const withoutTemp = filtered.slice(0, -1); // Remove temp user message

      return [
        ...withoutTemp,
        {
          message_id: data.userMessage?.message_id,
          sender: "user",
          image: imagePreviewUrl,
          imageUrl: data.userMessage?.image_urls?.[0],
          created_at: data.userMessage?.created_at
        },
        {
          message_id: data.assistantMessage?.message_id,
          sender: "bot",
          text: botResponseText, // ✅ Now properly extracts the response
          messageClass: getMessageClass(data.assistantMessage?.metadata, 'assistant'),
          created_at: data.assistantMessage?.created_at,
          metadata: data.assistantMessage?.metadata
        },
      ];
    });

    setSelectedImage(null);

    // Reset file input
    const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';

  } catch (error: any) {
    console.error("Error uploading image:", error);
    setError(error.message || "Failed to analyze image. Please try again.");
    
    // Remove loading message and show error
    setMessages((prev) => {
      const filtered = prev.filter((msg) => !msg.isLoading);
      return [
        ...filtered,
        {
          sender: "bot",
          text: `❌ Error: ${error.message || 'Failed to analyze image'}. Please try again.`,
          messageClass: darkMode
            ? "bg-red-900/30 text-red-200 border border-red-700/50"
            : "bg-red-100 text-red-800 border border-red-300",
        },
      ];
    });
    setSelectedImage(null);
  } finally {
    setIsLoading(false);
  }
};

  const handleTextMessage = async () => {
    if (!input.trim()) return;

    // Must have an active conversation to send text messages
    if (!conversationId) {
      setError("Please upload an image first to start a conversation");
      return;
    }

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const tempUserMsg: ChatMessage = {
      sender: "user",
      text: userMessage,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    // Add loading indicator
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Thinking...", isLoading: true },
    ]);

    try {
      const res = await fetch(`${API_BASE_URL}/ml/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify({
          message: userMessage,
          convo_id: conversationId
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();

      // Remove loading indicator and temp message, add real messages
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered.slice(0, -1), // Remove temp user message
          {
            message_id: data.userMessage?.message_id,
            sender: "user",
            text: userMessage,
            created_at: data.userMessage?.created_at
          },
          {
            message_id: data.assistantMessage?.message_id,
            sender: "bot",
            text: data.assistantMessage?.content || data.response,
            messageClass: darkMode
              ? "bg-gray-800 text-gray-100 border border-gray-700"
              : "bg-white text-gray-900 border border-gray-300",
            created_at: data.assistantMessage?.created_at,
            metadata: data.assistantMessage?.metadata
          },
        ];
      });

    } catch (error: any) {
      console.error("Chat error:", error);
      setError(error.message || "Failed to send message");
      
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            sender: "bot",
            text: `❌ ${error.message || 'Sorry, I couldn\'t process your message. Please try again.'}`,
            messageClass: darkMode
              ? "bg-red-900/30 text-red-200 border border-red-700/50"
              : "bg-red-100 text-red-800 border border-red-300",
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (selectedImage) {
      handleImageUpload();
    } else if (input.trim()) {
      handleTextMessage();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewConversation = () => {
    setConversationId(null);
    setConversationTitle("");
    setMessages([]);
    setSelectedImage(null);
    setInput("");
    setError(null);
    navigate("/home");
  };

  return (
    <div className="min-h-screen min-w-screen flex flex-col">
      {/* Header with conversation title */}
      {conversationTitle && (
        <div className={`fixed top-16 left-0 right-0 z-10 px-6 py-3 border-b ${
          darkMode 
            ? 'bg-gray-900/95 border-gray-800 text-gray-200' 
            : 'bg-white/95 border-gray-200 text-gray-900'
        } backdrop-blur-sm`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <h2 className="text-lg font-semibold truncate">{conversationTitle}</h2>
            <button
              onClick={startNewConversation}
              className={`text-sm px-4 py-2 rounded-lg transition-colors ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              New Chat
            </button>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className={`fixed top-${conversationTitle ? '28' : '16'} left-0 right-0 z-10 px-6 py-3 ${
          darkMode ? 'bg-red-900/50' : 'bg-red-100'
        }`}>
          <div className="max-w-4xl mx-auto flex items-center gap-2">
            <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-300' : 'text-red-600'}`} />
            <p className={darkMode ? 'text-red-200' : 'text-red-800'}>{error}</p>
            <button
              onClick={() => setError(null)}
              className={`ml-auto ${darkMode ? 'text-red-300 hover:text-red-100' : 'text-red-600 hover:text-red-800'}`}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex justify-center">
        <div className="w-screen max-w-screen max-h-screen flex flex-col p-2">
          
          {/* Messages Area */}
          <div className={`flex-1 w-full overflow-auto p-6 ${conversationTitle ? 'pt-32' : 'pt-24'}`}>
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className={`text-center py-12 transition-colors duration-200 ${
                  darkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  <div className={`w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    darkMode ? 'bg-gray-800' : 'bg-gray-200'
                  }`}>
                    <ImagePlus className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Upload a coffee leaf image</h3>
                  <p>Get instant disease detection and expert advice</p>
                  <p className="mt-2 text-sm opacity-75">Then ask me follow-up questions!</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div
                  key={msg.message_id || idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-lg p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                      msg.sender === "user"
                        ? darkMode 
                          ? "bg-blue-600 text-white" 
                          : "bg-blue-500 text-white"
                        : msg.messageClass || (darkMode 
                          ? "bg-gray-800 text-gray-200 border border-gray-700" 
                          : "bg-white text-gray-800 border border-gray-200")
                    }`}
                  >
                    {msg.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    ) : (
                      <>
                        {/* Status indicator for bot messages */}
                        {msg.sender === "bot" && msg.metadata && (
                          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-current border-opacity-20">
                            {getStatusIcon(msg.metadata)}
                            {getStatusLabel(msg.metadata)}
                          </div>
                        )}

                        {(msg.image || msg.imageUrl) && (
                          <img
                            src={msg.image || msg.imageUrl}
                            alt="uploaded"
                            className="rounded-lg max-h-64 w-full object-cover mb-2"
                          />
                        )}
                        {msg.text && (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.text.split('**').map((part, i) => 
                              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            )}
                          </div>
                        )}
                        {msg.metadata && (
                          <p className="mt-2 text-xs italic">
                            Confidence: {(msg.metadata.confidence * 100).toFixed(2)}%
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className={`rounded-xl mb-4 p-2 mx-4 transition-colors duration-200 ${
            darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-gray-100 border border-gray-300'
          }`}>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                className="hidden"
                onChange={handleFileChange}
                disabled={isLoading}
              />

              <label 
                htmlFor="imageUpload" 
                className={`cursor-pointer p-3 rounded-xl transition-colors duration-200 ${
                  isLoading 
                    ? 'opacity-50 cursor-not-allowed' 
                    : darkMode 
                      ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                      : 'bg-white hover:bg-gray-50 text-gray-600'
                }`}
              >
                <ImagePlus className="w-5 h-5" />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedImage 
                    ? "Image ready - click send to analyze" 
                    : conversationId 
                      ? "Ask a follow-up question..." 
                      : "Upload an image to start..."
                }
                disabled={!!selectedImage || isLoading}
                className={`flex-1 px-4 py-3 rounded-xl bg-transparent transition-colors duration-200 focus:outline-none ${
                  darkMode ? 'text-gray-200 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
                } ${selectedImage || isLoading ? 'opacity-50' : ''}`}
              />

              <button
                onClick={handleSend}
                disabled={(!selectedImage && !input.trim()) || isLoading}
                className={`p-3 rounded-xl justify-between flex transition-all duration-200 ${
                  (selectedImage || (input.trim() && conversationId)) && !isLoading
                    ? darkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
            
            {selectedImage && (
              <div className={`mt-3 p-3 rounded-lg ${
                darkMode ? 'bg-gray-700/50' : 'bg-blue-50'
              }`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                    📷 {selectedImage.name}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedImage(null);
                      const fileInput = document.getElementById('imageUpload') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }}
                    className={`text-sm ${
                      darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-blue-600 hover:text-blue-800'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>

          <p className={`text-center text-xs pb-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            GrowFrika can make mistakes. Always consult a local expert for critical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;