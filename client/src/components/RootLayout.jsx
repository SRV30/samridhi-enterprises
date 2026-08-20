import React from 'react';
import PremiumFooter from './PremiumFooter';
import Header from './Header';
import Navbar from './Navbar';
import SupportAssistant from './SupportAssistant';
import CompareTray from './CompareTray';
import SessionTimeoutHandler from './SessionTimeoutHandler';

export const RootLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">
    <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md focus:shadow-lg">Skip to main content</a>
    <Header />
    <Navbar />
    <main id="main-content" tabIndex={-1} className="flex-grow">{children}</main>
    <PremiumFooter />
    <SessionTimeoutHandler />
    <SupportAssistant />
    <CompareTray />
  </div>
);

export default RootLayout;