import React from "react";
import { ShieldCheck, Truck, CreditCard, Headphones } from "lucide-react";
import BannerProduct from "../extras/BannerProduct";
import BrandList from "../components/BrandList";
import CategoryRows from "./products/CategoryRows";
import SEO from "../components/SEO";

const trustItems = [
  [ShieldCheck, "Quality assured", "Reliable spare parts"],
  [Truck, "Delivery support", "Order tracking available"],
  [CreditCard, "Secure checkout", "Protected payment flow"],
  [Headphones, "Customer support", "Help when you need it"],
];

const Home = () => (
  <div className="pt-[108px] bg-[var(--surface-1)] min-h-screen">
    <SEO title="Home" />
    <BannerProduct />
    <div className="max-w-[1440px] mx-auto px-3 sm:px-5 lg:px-7 py-4 sm:py-5">
      <div className="premium-card grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-[var(--line)] overflow-hidden">
        {trustItems.map(([Icon, title, text]) => <div key={title} className="flex items-center gap-3 px-4 py-3.5 sm:px-5"><Icon className="w-5 h-5 text-blue-600 shrink-0" /><div><p className="text-xs font-bold text-[var(--text-strong)]">{title}</p><p className="text-[10px] text-[var(--text-muted)] mt-0.5">{text}</p></div></div>)}
      </div>
    </div>
    <BrandList />
    <CategoryRows />
  </div>
);

export default Home;
