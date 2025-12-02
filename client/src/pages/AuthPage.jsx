import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between Login/Signup
  const { login, signup, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLogin) {
      await login(formData.email, formData.password);
    } else {
      await signup(formData.username, formData.email, formData.password);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden">
      
      {/* --- Background Gradients (Similar to TeamSync Hero) --- */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-purple-900/40 blur-[100px]" />
         <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[120px]" />
      </div>

      {/* --- Auth Card --- */}
      <div className="bg-gray-900/80 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-2xl w-full max-w-md relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-2 text-white tracking-tight">
            {isLogin ? "Welcome Back" : "Join TeamSync"}
          </h2>
          <p className="text-gray-400 text-sm">
            {isLogin ? "Enter your credentials to access your workspace." : "Create an account to start collaborating instantly."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username (Signup Only) */}
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Username</label>
              <input
                type="text"
                name="username"
                required
                className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
                placeholder="johndoe"
                onChange={handleChange}
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              name="email"
              required
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
              placeholder="name@company.com"
              onChange={handleChange}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              name="password"
              required
              className="w-full px-4 py-2.5 bg-gray-950 border border-gray-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-600 transition-all"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold py-3 rounded-lg hover:opacity-90 transition transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-900/20 mt-2"
          >
            {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        {/* Toggle Login/Signup */}
        <div className="mt-8 text-center border-t border-gray-800 pt-6">
          <p className="text-gray-400 text-sm">
            {isLogin ? "New to TeamSync?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-400 font-semibold hover:text-purple-300 transition hover:underline ml-1"
            >
              {isLogin ? "Create account" : "Log in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;