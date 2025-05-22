import HomePage from '../pages/home/home-page';
import StoryPage from '../pages/story/story-page';
import CalendarPage from '../pages/calendar/calendar-page';
import NotificationPage from '../pages/notification/notification-page';
import ProfilePage from '../pages/profile/profile-page';
import LoginPage from '../pages/auth/login/login-page';
import RegisterPage from '../pages/auth/register/register-page';

const routes = {
    '/': new HomePage(),
    '/story': new StoryPage(),
    '/calendar': new CalendarPage(),
    '/notification': new NotificationPage(),
    '/profile': new ProfilePage(),
    '/login': new LoginPage(),
    '/register': new RegisterPage()
};

export default routes;
