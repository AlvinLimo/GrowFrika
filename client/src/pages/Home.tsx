import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function Homepage() {
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
