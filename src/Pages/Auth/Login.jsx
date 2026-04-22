import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/Educatia-Logo.png";

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

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const floatAnimation = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: "easeOut" },
  },
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
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#f0f9f9] overflow-hidden font-sans selection:bg-[#009E99]/20">
      {/* Animated Background Blobs */}
      <motion.div
        animate={{ scale: [1, 1.25, 1], x: [0, 50, 0], y: [0, -30, 0] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-[#009E99]/10 blur-3xl"
      />
      <motion.div
        animate={{ scale: [1, 1.15, 1], x: [0, -60, 0], y: [0, 50, 0] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute bottom-[-15%] right-[-10%] w-[420px] h-[420px] rounded-full bg-[#009E99]/15 blur-3xl"
      />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="container max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 z-10"
      >
        {/* === LEFT SIDE - BRANDING === */}
        <div className="hidden lg:flex flex-col justify-center space-y-12">
          <div className="w-24 h-24 flex items-center justify-center drop-shadow-xl">
            <img
              src={logo}
              alt="Educatia Logo"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="space-y-6">
            <motion.h2
              variants={fadeInUp}
              className="text-5xl font-extrabold text-slate-800 leading-[1.05]"
            >
              Dream big with <br />
              <span className="text-[#009E99] relative inline-block">
                Global Education
                <motion.svg
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.8, delay: 0.8 }}
                  className="absolute -bottom-1 left-0 w-full h-4"
                  viewBox="0 0 120 12"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 6 Q 30 1 60 6 T 120 6"
                    stroke="#009E99"
                    strokeWidth="5"
                    fill="transparent"
                    strokeLinecap="round"
                  />
                </motion.svg>
              </span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="text-slate-600 text-xl max-w-md leading-relaxed"
            >
              Your seamless journey to international success starts here. One
              beautiful platform for students, counsellors & admins.
            </motion.p>
          </div>

          {/* Floating Stats Cards */}
          <div className="grid grid-cols-2 gap-6 pt-2">
            <motion.div
              variants={floatAnimation}
              whileHover={{ y: -8, scale: 1.03 }}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-[#009E99]/10 border border-[#009E99]/10"
            >
              <div className="text-5xl font-bold text-slate-800 mb-1">
                2.4k+
              </div>
              <div className="text-[#009E99] font-semibold">
                Students Enrolled
              </div>
              <div className="text-xs text-slate-400 mt-4">
                Across 12+ countries
              </div>
            </motion.div>

            <motion.div
              variants={floatAnimation}
              whileHover={{ y: -8, scale: 1.03 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-6 shadow-xl shadow-[#009E99]/10 border border-[#009E99]/10"
            >
              <div className="text-5xl font-bold text-slate-800 mb-1">98%</div>
              <div className="text-[#009E99] font-semibold">Success Rate</div>
              <div className="text-xs text-slate-400 mt-4">
                In university placements
              </div>
            </motion.div>
          </div>
        </div>

        {/* === RIGHT SIDE - LOGIN CARD === */}
        <motion.div
          variants={fadeInUp}
          className="flex items-center justify-center"
        >
          <div className="w-full max-w-md bg-white p-10 rounded-[3rem] shadow-[0_30px_70px_-15px_rgba(0,158,153,0.18)] border border-[#009E99]/5">
            <div className="mb-10 text-center lg:text-left">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">
                Welcome back!
              </h1>
              <p className="text-slate-400">
                Please enter your details to sign in.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm flex items-center gap-3"
                >
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  placeholder="hello@educatia.com"
                  className={`w-full bg-slate-50 border-2 ${emailErr ? "border-red-200" : "border-transparent"} focus:border-[#009E99]/30 focus:bg-white rounded-2xl p-4 text-slate-800 outline-none transition-all duration-300 shadow-sm`}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    dispatch(clearError());
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    placeholder="••••••••"
                    className={`w-full bg-slate-50 border-2 ${passwordErr ? "border-red-200" : "border-transparent"} focus:border-[#009E99]/30 focus:bg-white rounded-2xl p-4 pr-12 text-slate-800 outline-none transition-all duration-300 shadow-sm`}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      dispatch(clearError());
                    }}
                    onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#009E99] transition-colors p-1"
                  >
                    {showPass ? (
                      <Eye size={20} strokeWidth={2} />
                    ) : (
                      <EyeOff size={20} strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-[#009E99] disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-[#009E99]/25 flex items-center justify-center gap-2 mt-4"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  "Sign In"
                )}
              </motion.button>
            </form>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
