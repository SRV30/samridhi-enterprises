import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { getSingleDetail, loginUser } from "@/store/auth-slice/user";
import { toast } from "react-toastify";
import MetaData from "../../extras/MetaData";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, ShieldCheck } from "lucide-react";

const Field = ({ icon: Icon, label, children }) => (
  <label className="block">
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[var(--text-muted)]">{label}</span>
    <span className="relative block">{Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-500" />}{children}</span>
  </label>
);

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);
  const { verifyEmail } = useSelector((state) => state.otp);
  const navigate = useNavigate();
  const location = useLocation();
  const redirect = location.search ? location.search.split("=")[1] : "/my-profile";

  useEffect(() => {
    if (error) toast.error(error);
    if (isAuthenticated) {
      dispatch(getSingleDetail());
      toast.success("Welcome back!");
      const verified = localStorage.getItem("verifyEmail") === "true";
      navigate(!verifyEmail && !verified ? "/verify-email" : redirect || "/");
    }
  }, [isAuthenticated, error, navigate, redirect, verifyEmail, dispatch]);

  const submit = (e) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");
    dispatch(loginUser({ email, password }));
  };

  return (
    <>
      <MetaData title="Sign In | Samridhi Enterprises" description="Sign in to your Samridhi Enterprises account." keywords="Samridhi Enterprises login, motorcycle parts account" />
      <main className="min-h-[calc(100vh-140px)] bg-[var(--surface-1)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface-0)] shadow-[0_24px_80px_rgba(15,23,42,.12)] lg:grid-cols-[1.05fr_.95fr]">
          <motion.section initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="relative hidden min-h-[620px] overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,.35),transparent_42%),radial-gradient(circle_at_90%_80%,rgba(14,165,233,.18),transparent_38%)]" />
            <div className="relative"><div className="mb-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/30"><ShieldCheck className="h-6 w-6" /></div><p className="mb-3 text-xs font-bold uppercase tracking-[.22em] text-blue-300">Samridhi Automotive</p><h1 className="max-w-md text-4xl font-black leading-tight">Your garage, parts and orders in one place.</h1><p className="mt-5 max-w-md text-sm leading-6 text-slate-300">Access your account to manage orders, saved products and support conversations.</p></div>
            <div className="relative grid grid-cols-3 gap-3"><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-lg font-black">Fast</p><p className="mt-1 text-xs text-slate-400">Checkout</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-lg font-black">Secure</p><p className="mt-1 text-xs text-slate-400">Account</p></div><div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-lg font-black">24/7</p><p className="mt-1 text-xs text-slate-400">Support</p></div></div>
          </motion.section>
          <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .08 }} className="p-6 sm:p-10 lg:p-14">
            <div className="mx-auto max-w-md"><div className="mb-8"><p className="text-xs font-bold uppercase tracking-[.18em] text-blue-600">Account access</p><h2 className="mt-2 text-3xl font-black tracking-tight text-[var(--text-strong)] sm:text-4xl">Welcome back.</h2><p className="mt-2 text-sm text-[var(--text-muted)]">Sign in to continue shopping smarter.</p></div>
              <form onSubmit={submit} className="space-y-5">
                <Field icon={Mail} label="Email"><input id="login-email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-1)] py-3.5 pl-11 pr-4 text-sm text-[var(--text-strong)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /></Field>
                <Field icon={LockKeyhole} label="Password"><input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" className="w-full rounded-xl border border-[var(--line)] bg-[var(--surface-1)] py-3.5 pl-11 pr-12 text-sm text-[var(--text-strong)] outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10" /><button type="button" onClick={() => setShowPassword((v) => !v)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[var(--text-muted)] hover:text-blue-600">{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></Field>
                <div className="flex items-center justify-between gap-4 text-sm"><label className="flex items-center gap-2 text-[var(--text-muted)]"><input type="checkbox" className="h-4 w-4 rounded accent-blue-600" />Remember me</label><Link to="/forgot-password" className="font-bold text-blue-600 hover:underline">Forgot password?</Link></div>
                <motion.button whileHover={{ y: -1 }} whileTap={{ scale: .98 }} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Signing in…" : <>Sign in <ArrowRight className="h-4 w-4" /></>}</motion.button>
              </form>
              <p className="mt-8 text-center text-sm text-[var(--text-muted)]">New to Samridhi? <Link to="/signup" className="font-bold text-blue-600 hover:underline">Create an account</Link></p>
            </div>
          </motion.section>
        </div>
      </main>
    </>
  );
};
export default Login;