import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function GoogleSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const user = params.get("user");

    if (token && user) {
      try {
        const decodedUser = decodeURIComponent(user);
        const parsedUser = JSON.parse(decodedUser);

        localStorage.clear();
        localStorage.setItem("token", token);
        localStorage.setItem("user", decodedUser);
        localStorage.setItem("userId", parsedUser.id);

        console.log("User data:", parsedUser);

        navigate(`/home/${parsedUser.id}`, { replace: true });
      } catch (error) {
        console.error("Failed to parse user data from URL", error);
      }
    } else {
      console.error("Token or user data not found in URL parameters.");
    }
  }, [location, navigate]);

  return <div className="p-6">Logging in with Google...</div>;
}

export default GoogleSuccess;
