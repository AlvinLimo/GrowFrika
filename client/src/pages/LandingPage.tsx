import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div>
      <h1 className="text-black">Welcome to GrowFrika</h1>
      <p className="text-black">Your journey to personal growth starts here.</p>
        <Link to="/login">Login</Link> | <Link to="/register">Sign Up</Link>
    </div>
  );
};
export default LandingPage;