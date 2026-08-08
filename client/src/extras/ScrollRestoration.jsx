import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Automatically scrolls the window to the top on every route change.
//
// This is distinct from the ScrollToTop back-to-top button: that button lets a
// user manually jump to the top of the current page, whereas this component
// restores scroll position on navigation so a newly-opened route doesn't
// inherit the previous page's scroll offset.
const ScrollRestoration = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollRestoration;
