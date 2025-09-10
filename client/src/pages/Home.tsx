import React, { useState } from "react";
import { Send, ImagePlus } from "lucide-react";
import axios from "axios";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface ChatMessage {
  sender: "user" | "bot";
  text?: string;
  image?: string;
}

const HomePage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
const location = useLocation();
  const navigate = useNavigate();

  interface User {
    id: string;
    username: string;
    email: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tokenFromURL = queryParams.get("token");
    const idFromURL = queryParams.get("id");

    if (tokenFromURL && idFromURL) {
      localStorage.setItem("token", tokenFromURL);
      localStorage.setItem("userId", idFromURL);

      // Optional: Clean the URL after storing the data
      navigate("/home", { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      let id = localStorage.getItem("userId");

      if (!id) {
        const userString = localStorage.getItem("user");
        if (userString) {
          try {
            const parsedUser = JSON.parse(userString);
            id = parsedUser?.id;
          } catch (err) {
            console.error("Failed to parse user from localStorage", err);
          }
        }
      }

      if (!token || !id) {
        setError("Token or User ID missing. Please log in.");
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/users/getbyID/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(response.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err) && err.response) {
          console.error("An error occurred:", err);
          setError(err.response.data?.message || "Failed to fetch user");
        } else {
          console.error("An unexpected error occurred:", err);
          setError("An unexpected error occurred");
        }
      }
    };

    fetchUser();
  }, []);
  // Handle file select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };

  // Handle send
  const handleSend = async () => {
  if (selectedImage) {
    const formData = new FormData();
    formData.append("image", selectedImage);

    const res = await fetch("http://localhost:5000/ml/predict", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    // Add user image to chat
    setMessages((prev) => [
      ...prev,
      { sender: "user", image: URL.createObjectURL(selectedImage) },
      {
        sender: "bot",
        text: `Prediction: ${data.prediction.class} (Confidence: ${data.prediction.confidence})`,
      },
    ]);

    setSelectedImage(null);
  }
};


  return (
   <div className="flex flex-col h-screen w-screen bg-gray-50">
  {/* Header / Welcome */}
  <div className="p-4 bg-white shadow-md">
    <h1 className="text-2xl font-bold text-blue-600">Home</h1>
    {error && <p className="text-red-600 font-medium">{error}</p>}
    {user ? (
      <div>
        <p className="text-lg font-semibold">Welcome, {user.username}!</p>
        <p className="text-gray-700">Email: {user.email}</p>
      </div>
    ) : !error ? (
      <p className="text-gray-500">Loading user data...</p>
    ) : null}
  </div>

  {/* Chat window (fills remaining space, scrollable) */}
  <div className="flex-1 overflow-y-auto px-12 py-4 space-y-3">
    {messages.map((msg, idx) => (
      <div
        key={idx}
        className={`flex ${
          msg.sender === "user" ? "justify-end" : "justify-start"
        }`}
      >
        <div
          className={`max-w-xs p-3 rounded-2xl shadow ${
            msg.sender === "user"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          {msg.text && <p>{msg.text}</p>}
          {msg.image && (
            <img
              src={msg.image}
              alt="uploaded"
              className="mt-2 rounded-lg max-h-40"
            />
          )}
        </div>
      </div>
    ))}
  </div>

  {/* Input box (always pinned at bottom) */}
  <div className="p-3 bg-white border-t flex items-center space-x-2">
    <input
      type="file"
      accept="image/*"
      id="imageUpload"
      className="hidden"
      onChange={handleFileChange}
    />

    <label htmlFor="imageUpload" className="cursor-pointer">
      <ImagePlus className="text-gray-600 hover:text-blue-500" />
    </label>

    <input
      type="text"
      value={input}
      onChange={(e) => setInput(e.target.value)}
      placeholder="Ask a question or upload an image..."
      className="flex-1 border rounded-xl px-3 py-2 focus:outline-none"
    />

    <button
      onClick={handleSend}
      className="bg-blue-500 text-white p-2 rounded-xl hover:bg-blue-600"
    >
      <Send size={18} />
    </button>
  </div>
</div>

  );
};

export default HomePage;
