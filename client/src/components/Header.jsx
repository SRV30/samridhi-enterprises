import { CircleUser, ShoppingCart, Sun, Moon, Heart, Menu, X, ChevronDown, Package, LogOut, UserCog, LifeBuoy, MapPin, LayoutDashboard, Search, Home, Grid2X2, ClipboardList } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "@/store/auth-slice/user";
import { useTheme } from "@/context/ThemeContext";
import SearchBar from "./SearchBar";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";

function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { cart } = useSelector((state) => state.cart);
  const { wishlist } = useSelector((state) => state.wishlist);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const cartCount = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
  const wishlistCount = wishlist?.items?.length || 0;
  const isStaff = isAuthenticated && ["ADMIN", "MANAGER"].includes(user?.role);

  useEffect(() => {
    const close = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
  }, [location.pathname]);

  const logout = () => {
    dispatch(logoutUser());
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  const active = (path) => location.pathname === path || (path !== "/" && location.pathname.startsWith(`${path}/`));
  const nav = [["Home", "/"], ["Products", "/products"], ["Brands", "/products"], ["Offers", "/products"], ["About Us", "/"], ["Contact Us", "/support"]];

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-50 bg-[var(--surface-0)]/95 backdrop-blur-xl border-b border-[var(--line)] shadow-[0_1px_12px_rgba(15,23,42,.05)]">
        <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7">
          <div className="h-16 flex items-center gap-3 lg:gap-5">
            <button onClick={() => setMenuOpen(true)} className="lg:hidden w-10 h-10 grid place-items-center rounded-xl hover:bg-[var(--surface-2)]" aria-label="Open menu"><Menu className="w-5 h-5" /></button>
            <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="Samridhi Enterprises home">
              <span className="w-9 h-9 rounded-xl bg-blue-600 text-white grid place-items-center font-black text-lg shadow-sm shadow-blue-600/25">S</span>
              <span className="leading-none hidden sm:block"><strong className="block text-base font-extrabold tracking-tight text-[var(--text-strong)]">Samridhi</strong><small className="block text-[9px] tracking-[.24em] text-[var(--text-muted)] uppercase mt-0.5">Enterprises</small></span>
            </Link>
            <button onClick={() => navigate("/products")} className="hidden md:flex h-10 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface-0)] text-xs font-semibold text-[var(--text-strong)] items-center gap-2 hover:border-blue-500 transition-colors">All Categories <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" /></button>
            <div className="flex-1 max-w-2xl mx-auto"><SearchBar variant="desktop" /></div>
            <nav className="hidden xl:flex items-center gap-1">
              <Link to="/products" className="text-xs font-semibold text-[var(--text-muted)] hover:text-blue-600 px-2 py-2">Brands</Link>
              <Link to="/wishlist" className="relative p-2 text-[var(--text-strong)] hover:text-blue-600" aria-label="Wishlist"><Heart className="w-5 h-5" />{wishlistCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-blue-600 text-white text-[9px] grid place-items-center">{wishlistCount}</span>}</Link>
              <Link to="/cart" className="relative p-2 text-[var(--text-strong)] hover:text-blue-600" aria-label="Cart"><ShoppingCart className="w-5 h-5" />{cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[9px] grid place-items-center">{cartCount}</span>}</Link>
            </nav>
            <button onClick={toggleTheme} className="hidden sm:grid w-9 h-9 place-items-center rounded-xl hover:bg-[var(--surface-2)] text-[var(--text-strong)]" aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>{theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}</button>
            <div className="relative hidden sm:block" ref={accountRef}>
              {isAuthenticated ? <button onClick={() => setAccountOpen((v) => !v)} className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[var(--surface-2)]" aria-expanded={accountOpen}><CircleUser className="w-5 h-5" /><span className="hidden lg:block text-xs font-semibold max-w-24 truncate">{user?.name || "My Account"}</span><ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" /></button> : <Link to="/login" className="flex items-center gap-2 px-2 py-2 text-xs font-semibold text-[var(--text-strong)]"><CircleUser className="w-5 h-5" /><span className="hidden lg:block">My Account<small className="block text-[10px] font-normal text-[var(--text-muted)]">Sign In</small></span></Link>}
              {accountOpen && <div className="absolute right-0 top-12 w-56 bg-[var(--surface-0)] border border-[var(--line)] rounded-2xl shadow-2xl p-2">
                {[["My Profile","/my-profile",CircleUser],["My Orders","/my-orders",Package],["Help & Support","/support",LifeBuoy],["My Addresses","/my-addresses",MapPin],["Edit Profile","/update-profile",UserCog]].map(([label,to,Icon]) => <Link key={to} to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-strong)] hover:bg-[var(--surface-2)]"><Icon className="w-4 h-4 text-blue-600" />{label}</Link>)}
                {isStaff && <Link to="/admin/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[var(--text-strong)] hover:bg-[var(--surface-2)]"><LayoutDashboard className="w-4 h-4 text-blue-600" />Admin Dashboard</Link>}
                <div className="h-px bg-[var(--line)] my-1" /><button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-500/10"><LogOut className="w-4 h-4" />Logout</button>
              </div>}
            </div>
          </div>
          <nav className="hidden lg:flex h-11 items-center gap-6 border-t border-[var(--line)]">
            {nav.map(([label,to]) => <Link key={label} to={to} className={`text-xs font-semibold transition-colors ${active(to) && label !== "Brands" && label !== "Offers" && label !== "About Us" ? "text-blue-600" : "text-[var(--text-muted)] hover:text-[var(--text-strong)]"}`}>{label}</Link>)}
            {isStaff && <Link to="/admin/dashboard" className="ml-auto text-xs font-semibold text-blue-600 flex items-center gap-1"><LayoutDashboard className="w-3.5 h-3.5" />Admin</Link>}
          </nav>
        </div>
      </header>

      {menuOpen && <div className="fixed inset-0 z-[70] lg:hidden"><button className="absolute inset-0 bg-slate-950/50" onClick={() => setMenuOpen(false)} aria-label="Close menu" /><aside className="absolute left-0 top-0 bottom-0 w-[min(86vw,340px)] bg-[var(--surface-0)] p-5 shadow-2xl overflow-y-auto"><div className="flex items-center justify-between mb-7"><Link to="/" className="font-extrabold text-lg">Samridhi Enterprises</Link><button onClick={() => setMenuOpen(false)} className="w-10 h-10 rounded-xl grid place-items-center hover:bg-[var(--surface-2)]" aria-label="Close menu"><X /></button></div><div className="space-y-1">{nav.map(([label,to]) => <Link key={label} to={to} className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm hover:bg-[var(--surface-2)]"><Search className="w-4 h-4 text-blue-600" />{label}</Link>)}<Link to="/wishlist" className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm hover:bg-[var(--surface-2)]"><Heart className="w-4 h-4 text-blue-600" />Wishlist</Link><Link to="/cart" className="flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm hover:bg-[var(--surface-2)]"><ShoppingCart className="w-4 h-4 text-blue-600" />Cart</Link>{isAuthenticated && <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl font-semibold text-sm text-red-500 hover:bg-red-500/10"><LogOut className="w-4 h-4" />Logout</button>}</div></aside></div>}
      <nav className="fixed bottom-0 inset-x-0 z-50 lg:hidden bg-[var(--surface-0)]/95 backdrop-blur-xl border-t border-[var(--line)] pb-[env(safe-area-inset-bottom)]"><div className="h-16 grid grid-cols-5 max-w-lg mx-auto"><Link to="/" className={`grid place-items-center text-[10px] font-semibold ${active("/") ? "text-blue-600" : "text-[var(--text-muted)]"}`}><Home className="w-5 h-5" />Home</Link><Link to="/products" className={`grid place-items-center text-[10px] font-semibold ${active("/products") ? "text-blue-600" : "text-[var(--text-muted)]"}`}><Grid2X2 className="w-5 h-5" />Categories</Link><Link to="/products" className="grid place-items-center text-[10px] font-semibold text-[var(--text-muted)]"><Search className="w-5 h-5" />Search</Link><Link to="/my-orders" className={`grid place-items-center text-[10px] font-semibold ${active("/my-orders") ? "text-blue-600" : "text-[var(--text-muted)]"}`}><ClipboardList className="w-5 h-5" />Orders</Link><Link to={isAuthenticated ? "/my-profile" : "/login"} className={`grid place-items-center text-[10px] font-semibold ${active("/my-profile") ? "text-blue-600" : "text-[var(--text-muted)]"}`}><CircleUser className="w-5 h-5" />Account</Link></div></nav>
    </>
  );
}

export default Header;
