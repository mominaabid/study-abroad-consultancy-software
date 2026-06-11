import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, ArrowRight } from "lucide-react";

import {
  loginUser,
  clearError,
  selectAuthError,
  selectAuthLoading,
  selectIsAuth,
  selectRole,
} from "../../redux/slices/authSlice";

// Import the AVIF image from your assets folder
import loginIllustrationImg from "../../assets/educatia_login_img.png";

const ROLE_PATHS = {
  admin: "/admin/dashboard",
  counsellor: "/counsellor/dashboard",
  student: "/student/dashboard",
};

// Updated component to use the AVIF image instead of inline SVG
const LoginIllustration = () => (
  <img
    src={loginIllustrationImg}
    alt="Secure login illustration"
    className="w-full max-w-sm mx-auto"
  />
);

// Animated bubbles background component
const BackgroundBubbles = () => {
  const [bubbles, setBubbles] = useState([]);

  useEffect(() => {
    // Inject keyframes for bubble animation globally
    const styleId = "bubble-keyframes-style";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes bubbleFloat {
          0% {
            transform: translate(0, 0) rotate(0deg);
          }
          50% {
            transform: translate(15px, -15px) rotate(3deg);
          }
          100% {
            transform: translate(-10px, -25px) rotate(-3deg);
          }
        }
      `;
      document.head.appendChild(style);
    }

    // Generate random bubbles
    const bubblesArray = Array.from({ length: 28 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      bottom: Math.random() * 100,
      size: 15 + Math.random() * 180,
      opacity: 0.1 + Math.random() * 0.35,
      duration: 6 + Math.random() * 22,
      delay: Math.random() * -15,
    }));
    setBubbles(bubblesArray);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            left: `${bubble.left}%`,
            bottom: `${bubble.bottom}%`,
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            background: `radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.04))`,
            opacity: bubble.opacity,
            animation: `bubbleFloat ${bubble.duration}s infinite alternate ease-in-out`,
            animationDelay: `${bubble.delay}s`,
            willChange: "transform",
            backdropFilter: "blur(1px)",
          }}
        />
      ))}
    </div>
  );
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#009E99] p-4 md:p-8 overflow-hidden">
      {/* Animated bubbles background */}
      <BackgroundBubbles />

      {/* Main login card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-gradient-to-br from-[#F0FDFA] to-white p-8 flex items-center justify-center border-r border-gray-100">
            <div className="w-full max-w-sm">
              <LoginIllustration />
              <div className="text-center mt-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Welcome Back to Educatia!
                </h2>
                <p className="text-gray-500 mt-2">
                  Sign in to continue your journey
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-sm text-[#009E99]">
                  <span className="w-2 h-2 rounded-full bg-[#009E99]" />
                  <span>Secure Access</span>
                  <span className="w-2 h-2 rounded-full bg-[#009E99]" />
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Login</h1>
              <div className="w-12 h-1 bg-[#009E99] rounded-full" />
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} autoComplete="off">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider ml-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  placeholder="you@example.com"
                  autoComplete="off"
                  className={`w-full bg-gray-50 border-2 rounded-xl p-3.5 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white ${
                    emailErr
                      ? "border-red-400 focus:border-red-400"
                      : "border-gray-200 focus:border-[#009E99]"
                  }`}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() =>
                    setTouched((prev) => ({ ...prev, email: true }))
                  }
                />
                {emailErr && (
                  <p className="text-red-500 text-xs ml-1">Email is required</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700 uppercase tracking-wider ml-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    className={`w-full bg-gray-50 border-2 rounded-xl p-3.5 pr-14 text-gray-800 outline-none transition-all placeholder:text-gray-400 focus:bg-white ${
                      passwordErr
                        ? "border-red-400 focus:border-red-400"
                        : "border-gray-200 focus:border-[#009E99]"
                    }`}
                    onChange={(e) => setPassword(e.target.value)}
                    onBlur={() =>
                      setTouched((prev) => ({ ...prev, password: true }))
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#009E99] transition-colors"
                  >
                    {showPass ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {passwordErr && (
                  <p className="text-red-500 text-xs ml-1">
                    Password is required
                  </p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#009E99] hover:bg-[#00817d] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-[#009E99]/20 flex items-center justify-center gap-3 mt-6 transition-all"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
