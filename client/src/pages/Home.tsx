import React, { useState, useEffect, useRef } from "react";
import { Send, ImagePlus, Loader2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface ChatMessage {
  sender: "user" | "bot";
  text?: string;
  image?: string;
  messageClass?: string;
  isLoading?: boolean;
}

interface HomeProps {
  darkMode: boolean;
}

const Home: React.FC<HomeProps> = ({ darkMode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle OAuth redirect
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromURL = queryParams.get("token");
    const idFromURL = queryParams.get("id");

    if (tokenFromURL && idFromURL) {
      localStorage.setItem("token", tokenFromURL);
      localStorage.setItem("userId", idFromURL);
      navigate("/home", { replace: true });
    }
  }, [location.search, navigate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("image", selectedImage);

    try {
      const res = await fetch("http://localhost:5000/api/ml/predict", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log("Response:", data);

      // Store conversation ID
      if (data.prediction?.conversationId) {
        setConversationId(data.prediction.conversationId);
      }

      let botMessage = "";
      let messageClass = "";

      if (data.prediction) {
        const prediction = data.prediction;

        if (prediction.status === "invalid_image") {
          botMessage = `❌ ${prediction.error}\n\n💡 ${prediction.suggestion}`;
          messageClass = darkMode
            ? "bg-red-900/30 text-red-200 border border-red-700/50"
            : "bg-red-100 text-red-800 border border-red-300";
        } else if (prediction.status === "low_quality_prediction") {
          botMessage = `⚠️ ${prediction.warning}\n\nPrediction: ${prediction.predicted_class}\nConfidence: ${(prediction.confidence * 100).toFixed(2)}%\n\n💡 ${prediction.suggestion}`;
          messageClass = darkMode
            ? "bg-yellow-900/30 text-yellow-200 border border-yellow-700/50"
            : "bg-yellow-100 text-yellow-800 border border-yellow-300";
        } else if (prediction.status === "success") {
          const confidencePercent = (prediction.confidence * 100).toFixed(2);
          const qualityIndicator = prediction.image_quality > 0.7 ? "🟢" : prediction.image_quality > 0.4 ? "🟡" : "🔴";

          botMessage =
            `${qualityIndicator} **Disease Prediction:**\n\n` +
            `🔍 **Result:** ${prediction.predicted_class}\n` +
            `📊 **Confidence:** ${confidencePercent}%\n` +
            `${prediction.reliable ? "✅ **Reliable prediction**" : "⚠️ **Low confidence - consider retaking photo**"}\n\n` +
            `📈 **Probabilities:**\n${Object.entries(prediction.all_probabilities)
              .map(([k, v]) => `- ${k}: ${((v as number) * 100).toFixed(2)}%`)
              .join("\n")}`;

          if (prediction.confidence > 0.8) {
            messageClass = darkMode
              ? "bg-green-900/30 text-green-200 border border-green-700/50"
              : "bg-green-100 text-green-800 border border-green-300";
          } else if (prediction.confidence > 0.5) {
            messageClass = darkMode
              ? "bg-blue-900/30 text-blue-200 border border-blue-700/50"
              : "bg-blue-100 text-blue-800 border border-blue-300";
          } else {
            messageClass = darkMode
              ? "bg-yellow-900/30 text-yellow-200 border border-yellow-700/50"
              : "bg-yellow-100 text-yellow-800 border border-yellow-300";
          }

          // Add both messages
          setMessages((prev) => [
            ...prev,
            { sender: "user", image: URL.createObjectURL(selectedImage) },
            { sender: "bot", text: botMessage, messageClass: messageClass },
          ]);

          // Add LLM response if available
          if (prediction.llm_response) {
            setMessages((prev) => [
              ...prev,
              {
                sender: "bot",
                text: `🤖 **Expert Advice:**\n\n${prediction.llm_response}\n\n💬 Feel free to ask me follow-up questions!`,
                messageClass: darkMode
                  ? "bg-gray-800 text-gray-100 border border-gray-700"
                  : "bg-white text-gray-900 border border-gray-300",
              },
            ]);
          }

          setSelectedImage(null);
          setIsLoading(false);
          return;
        }
      }

      setMessages((prev) => [
        ...prev,
        { sender: "user", image: URL.createObjectURL(selectedImage) },
        { sender: "bot", text: botMessage, messageClass: messageClass },
      ]);

      setSelectedImage(null);
    } catch (error) {
      console.error("Error:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "user", image: URL.createObjectURL(selectedImage) },
        {
          sender: "bot",
          text: `❌ Error: Failed to analyze image. Please try again.`,
          messageClass: darkMode
            ? "bg-red-900/30 text-red-200 border border-red-700/50"
            : "bg-red-100 text-red-800 border border-red-300",
        },
      ]);
      setSelectedImage(null);
    }
    
    setIsLoading(false);
  };

  const handleTextMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message
    setMessages((prev) => [
      ...prev,
      { sender: "user", text: userMessage },
    ]);

    // Add loading indicator
    setMessages((prev) => [
      ...prev,
      { sender: "bot", text: "Typing...", isLoading: true },
    ]);

    try {
      const res = await fetch("http://localhost:5000/api/ml/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId,
        }),
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();

      // Update conversation ID if new
      if (data.conversationId && !conversationId) {
        setConversationId(data.conversationId);
      }

      // Remove loading indicator and add response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            sender: "bot",
            text: data.response,
            messageClass: darkMode
              ? "bg-gray-800 text-gray-100 border border-gray-700"
              : "bg-white text-gray-900 border border-gray-300",
          },
        ];
      });
    } catch (error) {
      console.error("Chat error:", error);
      
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            sender: "bot",
            text: "❌ Sorry, I couldn't process your message. Please try again.",
            messageClass: darkMode
              ? "bg-red-900/30 text-red-200 border border-red-700/50"
              : "bg-red-100 text-red-800 border border-red-300",
          },
        ];
      });
    }

    setIsLoading(false);
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

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex justify-center">
        <div className="w-screen h-screen overflow-y-auto flex flex-col px-4">
          
          {/* Messages Area */}
          <div className="flex-1 w-full pt-40 overflow-auto p-6">
            <div className="space-y-4">
              {messages.length === 0 && (
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
                  <p className="mt-2 text-sm">Or just ask me anything about coffee plants!</p>
                </div>
              )}
              
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-lg p-4 rounded-2xl shadow-sm transition-all duration-200 ${
                      msg.sender === "user"
                        ? darkMode 
                          ? "bg-blue-600 text-white" 
                          : "bg-blue-500 text-white"
                        : msg.messageClass || (darkMode 
                          ? "bg-gray-700 text-gray-200" 
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
                        {msg.text && (
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {msg.text.split('**').map((part, i) => 
                              i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            )}
                          </div>
                        )}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="uploaded"
                            className="mt-3 rounded-lg max-h-48 w-full object-cover"
                          />
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
          <div className={`rounded-xl mb-4 p-2 ml-16 mr-16 transition-colors duration-200 ${
            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-200 border-gray-700'
          }`}>
            <div className="flex items-center space-x-3">
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                className="hidden"
                onChange={handleFileChange}
              />

              <label 
                htmlFor="imageUpload" 
                className={`cursor-pointer p-3 rounded-xl transition-colors duration-200 ${
                  darkMode 
                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                <ImagePlus className="w-5 h-5" />
              </label>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={selectedImage ? "Image selected - click send" : "Ask me anything about coffee plants..."}
                disabled={!!selectedImage || isLoading}
                className={`flex-1 px-4 py-3 rounded-xl bg-transparent transition-colors duration-200 focus:outline-none ${
                  darkMode ? 'text-gray-200 placeholder-gray-400' : 'text-gray-900 placeholder-gray-500'
                } ${selectedImage || isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              />

              <button
                onClick={handleSend}
                disabled={(!selectedImage && !input.trim()) || isLoading}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  (selectedImage || input.trim()) && !isLoading
                    ? darkMode 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-green-500 hover:bg-green-600 text-white'
                    : darkMode 
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                }`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
            
            {selectedImage && (
              <div className={`mt-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'}`}>
                <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-blue-700'}`}>
                  📷 Ready to analyze: {selectedImage.name}
                </p>
              </div>
            )}
          </div>

          <p className={`justify-center flex text-xs pb-2 pt-0 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
            GrowFrika can make wrong presumptions. Always consult a local expert for critical decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;