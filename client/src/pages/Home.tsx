import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function Homepage() {
  const { id } = useParams();
  interface User {
    id: string;
    username: string;
    email: string;
  }

  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No token found. Please log in.");
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
  }, [id]);

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white shadow-md rounded">
      <h1 className="text-2xl font-bold mb-4 text-blue-600">Home</h1>
      
      {error && (
        <p className="text-red-600 font-medium mb-4">{error}</p>
      )}

      {user ? (
        <div>
          <p className="text-lg font-semibold mb-2">Welcome, {user.username}!</p>
          <p className="text-gray-700 mb-1">Email: {user.email}</p>
        </div>
      ) : !error ? (
        <p className="text-gray-500">Loading user data...</p>
      ) : null}
    </div>
  );
}

export default Homepage;
