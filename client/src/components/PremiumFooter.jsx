import { ArrowUpRight, CarFront, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const columns = [
  { title: "Shop", links: [{ label: "All Products", to: "/products" }, { label: "Compare", to: "/compare" }, { label: "Wishlist", to: "/wishlist" }, { label: "My Orders", to: "/my-orders" }] },
  { title: "Account", links: [{ label: "Sign In", to: "/login" }, { label: "Create Account", to: "/signup" }, { label: "Support", to: "/support" }, { label: "My Addresses", to: "/my-addresses" }] },
];

export default function PremiumFooter() {
  return <footer className="relative overflow-hidden border-t border-[var(--line)] bg-slate-950 text-white">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(37,99,235,.2),transparent_34%),radial-gradient(circle_at_85%_90%,rgba(14,165,233,.12),transparent_30%)]" aria-hidden="true" />
    <div className="relative mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr]">
        <div><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-600 shadow-lg shadow-blue-600/20"><CarFront className="h-5 w-5" /></span><span className="text-lg font-black tracking-tight">Samridhi Enterprises</span></div><p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">Premium motorcycle and automotive parts, backed by a simple shopping experience and dependable support.</p><div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-slate-300"><ShieldCheck className="h-4 w-4 text-blue-400" /> Secure account & checkout</div></div>
        {columns.map((column) => <nav key={column.title} aria-label={column.title}><h2 className="text-xs font-black uppercase tracking-[.18em] text-slate-400">{column.title}</h2><ul className="mt-4 space-y-3">{column.links.map((link) => <li key={link.label}><Link to={link.to} className="group inline-flex items-center gap-1 text-sm font-semibold text-slate-200 transition hover:text-white">{link.label}<ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" /></Link></li>)}</ul></nav>)}
        <div><h2 className="text-xs font-black uppercase tracking-[.18em] text-slate-400">Contact</h2><div className="mt-4 space-y-4 text-sm text-slate-300"><a href="mailto:support@samridhienterprises.com" className="flex items-center gap-3 hover:text-white"><Mail className="h-4 w-4 text-blue-400" />support@samridhienterprises.com</a><a href="tel:+919999999999" className="flex items-center gap-3 hover:text-white"><Phone className="h-4 w-4 text-blue-400" />+91 99999 99999</a><span className="flex items-center gap-3"><MapPin className="h-4 w-4 text-blue-400" />India</span></div></div>
      </div>
      <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© {new Date().getFullYear()} Samridhi Enterprises. All rights reserved.</span><span>Built for a faster automotive shopping experience.</span></div>
    </div>
    <motion.div aria-hidden="true" className="absolute left-0 top-0 h-px w-full origin-left bg-blue-500" initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} />
  </footer>;
}