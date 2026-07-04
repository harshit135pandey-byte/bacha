import { Routes, Route } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import About from './pages/About';
import Students from './pages/students/Students';
import StudentVideoDetail from './pages/students/StudentVideoDetail';
import Parents from './pages/parents/Parents';
import ParentArticleDetail from './pages/parents/ParentArticleDetail';
import Community from './pages/community/Community';
import CommunityEventDetail from './pages/community/CommunityEventDetail';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import UserDashboard from './pages/dashboard/UserDashboard';
import Profile from './pages/dashboard/Profile';
import Bookmarks from './pages/dashboard/Bookmarks';
import WatchHistory from './pages/dashboard/WatchHistory';
import ChangePassword from './pages/dashboard/ChangePassword';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminVideos from './pages/admin/AdminVideos';
import AdminCategories from './pages/admin/AdminCategories';
import AdminQuotes from './pages/admin/AdminQuotes';
import AdminArticles from './pages/admin/AdminArticles';
import AdminEvents from './pages/admin/AdminEvents';
import AdminImages from './pages/admin/AdminImages';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLogs from './pages/admin/AdminLogs';
import NotFound from './pages/NotFound';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/students" element={<Students />} />
        <Route path="/students/:id" element={<StudentVideoDetail />} />
        <Route path="/parents" element={<Parents />} />
        <Route path="/parents/:slug" element={<ParentArticleDetail />} />
        <Route path="/community" element={<Community />} />
        <Route path="/community/events/:id" element={<CommunityEventDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
      </Route>

      <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="bookmarks" element={<Bookmarks />} />
        <Route path="history" element={<WatchHistory />} />
        <Route path="change-password" element={<ChangePassword />} />
      </Route>

      <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="videos" element={<AdminVideos />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="quotes" element={<AdminQuotes />} />
        <Route path="articles" element={<AdminArticles />} />
        <Route path="events" element={<AdminEvents />} />
        <Route path="images" element={<AdminImages />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="messages" element={<AdminMessages />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="logs" element={<AdminLogs />} />
      </Route>

      <Route path="*" element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
