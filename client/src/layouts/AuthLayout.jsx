import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout = () => {
  return (
    <main id="main-content" tabIndex={-1}>
      <Outlet />
    </main>
  );
};

export default AuthLayout;
