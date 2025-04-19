import { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Signup() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e: { target: { name: string; value: string } }) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (
      e.target.name === "confirmPassword" ||
      (e.target.name === "password" && form.confirmPassword)
    ) {
      if (
        e.target.name === "confirmPassword" &&
        e.target.value !== form.password
      ) {
        setError("Passwords do not match");
      } else if (
        e.target.name === "password" &&
        form.confirmPassword !== e.target.value
      ) {
        setError("Passwords do not match");
      } else {
        setError("");
      }
    }
  };

  const handleSubmit = async () => {
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/users/create", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      console.log(res.data);
      setSuccess("User created successfully!");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Signup failed. Try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-8 rounded shadow-md w-full max-w-sm bg-gray-100">
        <h1 className="text-xl mb-4">Sign Up</h1>

        <input
          name="username"
          type="text"
          placeholder="Username"
          className="block border mb-2 px-2 py-1 w-full"
          onChange={handleChange}
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          className="block border mb-2 px-2 py-1 w-full"
          onChange={handleChange}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          className="block border mb-2 px-2 py-1 w-full"
          onChange={handleChange}
        />
        <input
          name="confirmPassword"
          type="password"
          placeholder="Confirm Password"
          className={`block border mb-4 px-2 py-1 w-full ${
            error ? "border-red-500" : ""
          }`}
          onChange={handleChange}
        />

        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        {success && (
          <div className="text-green-600 text-sm mb-2">
            {success}{" "}
            <Link to="/login" className="text-blue-600 underline ml-2">
              Go to Login
            </Link>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-black px-4 py-2 rounded shadow-md w-full"
        >
          Signup
        </button>
        <Link to="/login" className="text-blue-600 underline ml-2">
              Login
            </Link>
      </div>
    </div>
  );
}
