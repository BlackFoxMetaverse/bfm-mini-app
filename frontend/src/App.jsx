import { useEffect, useRef, memo } from "react";
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
import SpinNew from "./pages/SpinNew";

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

// Should show nav
const shouldShowNavigation = (pathname) => {
  if (pathname.startsWith("/read") && pathname !== "/read") return false;
  return pagesWithNavigation.includes(pathname);
};

// ✅ Simple PageWrapper without animations
const PageWrapper = memo(({ children }) => (
  <div className="min-h-screen w-full bg-[#141414]">
    <div className="w-full overflow-auto">{children}</div>
  </div>
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

// ✅ StaticRoutes (no animations)
function StaticRoutes({ user }) {
  const location = useLocation();

  // --- Analytics: send page path to gtag on every route change ---
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.gtag) {
        const pagePath = window.location.pathname + window.location.search;
        window.gtag("config", MEASUREMENT_ID, {
          page_path: pagePath,
        });
      }
    } catch (e) {
      // swallow any errors so analytics never crash the app
    }
  }, [location.pathname, location.search]);

  const showNav = shouldShowNavigation(location.pathname);

  return (
    <Layout showNavigation={showNav}>
      <div className="relative min-h-screen">
        <Routes location={location}>
          {routesConfig.map(
            ({ path, element, protected: isProtected, passUser }, i) => (
              <Route
                key={i}
                path={path}
                element={
                  <PageWrapper>
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
      <StaticRoutes user={user} />
    </Router>
  );
}

export default App;
