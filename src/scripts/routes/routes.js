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
} from "../utils/auth";

const routes = {
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/register": () => checkUnauthenticatedRouteOnly(new RegisterPage()),
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/story": () => checkAuthenticatedRoute(new StoryPage()),
  "/calendar": () => checkAuthenticatedRoute(new CalendarPage()),
  "/notification": () => checkAuthenticatedRoute(new NotificationPage()),
  "/profile": () => checkAuthenticatedRoute(new ProfilePage()),
  "/chatbot": () => checkAuthenticatedRoute(new ChatbotPage()),
  "/story/:id": (id) => checkAuthenticatedRoute(new StoryDetailPage(id)),
};

export default routes;
