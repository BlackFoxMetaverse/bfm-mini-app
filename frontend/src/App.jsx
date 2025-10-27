import { useEffect, useRef, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axiosInstance from "./utils/axios";
import { useTelegramUser } from "./hooks/useTelegramUser";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Auth from "./pages/auth";
import Home from "./pages/home";
import Spin from "./pages/spin";
import Quiz from "./pages/quiz";
import Tasks from "./pages/tasks";
import Invite from "./pages/invite";
import ProtectedRoute from "./components/ProtectedRoute";
import ReferredUsers from "./pages/ReferredUsers";
import { Layout } from "./layout/Layout";
import LeadNew from "./pages/LeadNew";
import UserDetails from "./pages/UserDetails";
import Games from "./pages/Games";

// Navigation order for directional transitions
const navOrder = ["/spin", "/tasks", "/home", "/leaderboard"];

// Google Analytics setup
const MEASUREMENT_ID = "G-61L96K0VV2";

// Pages with bottom navigation
const pagesWithNavigation = [
  "/games",
  "/tasks",
  "/home",
  "/leaderboard",
  "/invite",
  "/spin",
];

// Direction calc
const getDirection = (from, to) => {
  const fromIndex = navOrder.indexOf(from);
  const toIndex = navOrder.indexOf(to);
  if (fromIndex === -1 || toIndex === -1) return 1;
  return toIndex > fromIndex ? 1 : -1;
};

// Should show nav
const shouldShowNavigation = (pathname) => {
  if (pathname.startsWith("/read") && pathname !== "/read") return false;
  return pagesWithNavigation.includes(pathname);
};

// Motion variants
const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
  center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
  exit: (direction) => ({
    zIndex: 0,
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    scale: 0.95,
  }),
};

const slideTransition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.8,
};

// ✅ Memoized PageWrapper
const PageWrapper = memo(({ children, direction }) => (
  <motion.div
    custom={direction}
    variants={slideVariants}
    initial="enter"
    animate="center"
    exit="exit"
    transition={slideTransition}
    className="absolute inset-0 w-full bg-[#141414]"
  >
    <div className="w-full overflow-auto">{children}</div>
  </motion.div>
));

// ✅ Central route config
const routesConfig = [
  { path: "/", element: <Auth />, protected: false },
  { path: "/home", element: <Home />, protected: true },
  { path: "/referrals", element: <ReferredUsers />, protected: true },
  { path: "/leaderboard", element: <LeadNew />, protected: true },
  { path: "/spin", element: <Spin />, protected: true },
  { path: "/quiz", element: <Quiz />, protected: true },
  { path: "/tasks", element: <Tasks />, protected: true },
  { path: "/invite", element: <Invite />, protected: true },
  { path: "/games", element: <Games />, protected: true },
  { path: "/profile", element: <UserDetails />, protected: true },
];

// ✅ AnimatedRoutes
function AnimatedRoutes({ user }) {
  const location = useLocation();
  const prevLocation = useRef(location.pathname);
  const direction = getDirection(prevLocation.current, location.pathname);

  useEffect(() => {
    prevLocation.current = location.pathname;
  }, [location.pathname]);

  // --- Analytics: send page path to gtag on every route change ---
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.gtag) {
        // Ensure we send the current path + query string
        const pagePath = window.location.pathname + window.location.search;
        window.gtag("config", MEASUREMENT_ID, {
          page_path: pagePath,
        });
      }
    } catch (e) {
      // swallow any errors so analytics never crash the app
      // console.debug("gtag error", e);
    }
  }, [location.pathname, location.search]);

  const showNav = shouldShowNavigation(location.pathname);

  return (
    <Layout showNavigation={showNav}>
      <div className="relative min-h-screen overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          <Routes location={location} key={location.pathname}>
            {routesConfig.map(
              ({ path, element, protected: isProtected, passUser }, i) => (
                <Route
                  key={i}
                  path={path}
                  element={
                    <PageWrapper direction={direction}>
                      {isProtected ? (
                        <ProtectedRoute>
                          {passUser ? <element.type user={user} /> : element}
                        </ProtectedRoute>
                      ) : passUser ? (
                        <element.type user={user} />
                      ) : (
                        element
                      )}
                    </PageWrapper>
                  }
                />
              ),
            )}
          </Routes>
        </AnimatePresence>
      </div>
    </Layout>
  );
}

// ✅ App component
function App() {
  const { user, isLoaded } = useTelegramUser();
  const hasSynced = useRef(false);

  useEffect(() => {
    if (user?.id && !hasSynced.current) {
      hasSynced.current = true;
      axiosInstance
        .post("/user", {
          telegramId: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          username: user.username,
          photoUrl: user.photo_url,
        })
        .catch((err) => console.error("Error applying referral:", err));
    }
  }, [user]);

  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#141414] font-sans text-lg text-white">
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <AnimatedRoutes user={user} />
    </Router>
  );
}

export default App;
