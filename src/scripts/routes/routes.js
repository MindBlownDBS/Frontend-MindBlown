import HomePage from "../pages/home/home-page";
import StoryPage from "../pages/story/story-page";
import CalendarPage from "../pages/calendar/calendar-page";
import NotificationPage from "../pages/notification/notification-page";
import ProfilePage from "../pages/profile/profile-page";
import LoginPage from "../pages/auth/login/login-page";
import RegisterPage from "../pages/auth/register/register-page";
import ChatbotPage from "../pages/chatbot/chatbot-page";
import StoryDetailPage from "../pages/story/story-detail-page";
import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
  checkProtectedRoute,
} from "../utils/auth";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => new HomePage(),
  "/story": () => checkProtectedRoute(new StoryPage()),
  "/calendar": () => checkProtectedRoute(new CalendarPage()),
  "/notification": () => checkProtectedRoute(new NotificationPage()),
  "/profile": () => checkProtectedRoute(new ProfilePage()),
  "/chatbot": () => new ChatbotPage(),
  "/story/:id": (id) => checkProtectedRoute(new StoryDetailPage(id)),
};

export default routes;
