import React from "react";
import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import SupportAssistant from "../components/SupportAssistant";
import CompareTray from "../components/CompareTray";

const MainLayout = () => {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
      <SupportAssistant />
      <CompareTray />
    </>
  );
};

export default MainLayout;
