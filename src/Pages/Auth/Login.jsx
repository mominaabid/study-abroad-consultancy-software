import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

// Assuming background.png is in your assets folder
import bgImage from "../../assets/background.png";

import {
  loginUser,
  clearError,
  selectAuthError,
  selectAuthLoading,
  selectIsAuth,
  selectRole,
} from "../../redux/slices/authSlice";

const ROLE_PATHS = {
  admin: "/admin/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/dashboard",
};

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isAuth = useSelector(selectIsAuth);
  const role = useSelector(selectRole);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [touched, setTouched] = useState({ email: false, password: false });

  useEffect(() => {
    if (isAuth && role && ROLE_PATHS[role]) {
      navigate(ROLE_PATHS[role], { replace: true });
    }
  }, [isAuth, role, navigate]);

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) return;
    dispatch(clearError());
    dispatch(loginUser({ email, password }));
  }

  const emailErr = touched.email && !email;
  const passwordErr = touched.password && !password;

  return (
    <div
      className="min-h-screen w-full flex items-center justify-end bg-cover bg-center bg-no-repeat font-sans relative overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      {/* Overlay to ensure text readability if needed */}
      <div className="absolute inset-0 bg-black/5 pointer-events-none" />

      <div className="container max-w-7xl mx-auto px-6 lg:px-20 z-10 flex justify-end">
        {/* --- Glassmorphism Login Card --- */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[420px] bg-white/10 backdrop-blur-[20px] p-10 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-white/20"
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
            <div className="w-12 h-1 bg-[#009E99] rounded-full" />
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-100 text-sm flex items-center gap-2"
              >
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-base font-bold text-white uppercase tracking-widest ml-1">
                Username
              </label>
              <input
                type="email"
                value={email}
                placeholder="email@example.com"
                className={`w-full bg-white/5 border-2 rounded-2xl p-4 text-white outline-none transition-all placeholder:text-white/50 ${
                  emailErr
                    ? "border-red-400/50"
                    : "border-white/10 focus:border-[#009E99] focus:bg-white/10"
                }`}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="text-base font-bold text-white uppercase tracking-widest ml-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  placeholder="••••••••"
                  className={`w-full bg-white/5 border-2 rounded-2xl p-4 pr-14 text-white outline-none transition-all placeholder:text-white/30 ${
                    passwordErr
                      ? "border-red-400/50"
                      : "border-white/10 focus:border-[#009E99] focus:bg-white/10"
                  }`}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-[#009E99] transition-colors"
                >
                  {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#009E99] to-[#00817d] text-white font-bold py-4 rounded-2xl shadow-lg shadow-[#009E99]/30 flex items-center justify-center gap-3 mt-6 transition-all"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer Info */}
        </motion.div>
      </div>
    </div>
  );
}
