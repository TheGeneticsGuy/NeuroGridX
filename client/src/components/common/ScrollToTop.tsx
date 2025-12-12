// Why this? Well, in SPAs, if you scroll to the bottom of say, the home page, and click the "About"
// button and navigate to the about page, you are at the bottom. This ensures you scroll back to top.

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;