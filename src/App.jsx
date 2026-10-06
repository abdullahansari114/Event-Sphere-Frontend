import { Routes, Route, Navigate, useLocation } from 'react-router-dom'

// ==================== PUBLIC PAGES ====================

import Login from './pages/login'
import Signup from './pages/signup'
import ForgotPassword from './pages/forgot-password'
import ResetPassword from './pages/reset-password'
import Home from './pages/home'
import Events from './pages/Events'
import PublicEventDetails from './pages/PublicEventDetails'
import Exhibitors from './pages/Exhibitors'
import ExhibitorDetails from './pages/ExhibitorDetails'
import About from './pages/About'
import Contact from './pages/Contact'
import Profile from './pages/profile'
import Notifications from './pages/Notifications'

// ==================== COMPONENTS ====================

import TopBar from './components/TopBar'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ChatWidget from './components/ChatWidget'
import DashboardLayout from './components/DashboardLayout'
import ScrollToTop from './components/ScrollToTop'
import Schedule from './components/sessions/Schedule'
import EventProducts from './components/EventProducts'

// ==================== CONTEXT ====================

import { ToastProvider } from './context/ToastContext'
import { NotificationProvider } from './context/NotificationContext'

// ==================== ADMIN PAGES ====================

import AdminDashboard from './pages/admin/Dashboard'
import AdminEvents from './pages/admin/Events'
import CreateEvent from './pages/admin/CreateEvent'
import EditEvent from './pages/admin/EditEvent'
import EventDetails from './pages/admin/EventDetails'
import AdminExhibitors from './pages/admin/Exhibitors'
import AdminBooths from './pages/admin/Booths'
import AdminSessions from './pages/admin/Sessions'
import AdminRegistrations from './pages/admin/Registrations'
import AdminAnalytics from './pages/admin/Analytics'
import AdminMessages from './pages/admin/Messages'
import AdminContactMessages from './pages/admin/ContactMessages'
import AdminNotifications from './pages/admin/Notifications'
import AdminSettings from './pages/admin/Settings'
import AdminProfile from './pages/admin/Profile'

// ==================== EXHIBITOR PAGES ====================

import ExhibitorDashboard from './pages/exhibitor/Dashboard'
import ExhibitorProfile from './pages/exhibitor/Profile'
import ExhibitorEvents from './pages/exhibitor/Events'
import ExhibitorEventDetails from './pages/exhibitor/EventDetails'
import ExhibitorApplications from './pages/exhibitor/Applications'
import ExhibitorBooths from './pages/exhibitor/Booths'
import ExhibitorProducts from './pages/exhibitor/Products'
import ExhibitorMessages from './pages/exhibitor/Messages'
import ExhibitorNotifications from './pages/exhibitor/Notifications'


function App() {
  const location = useLocation()

  // ==================== DASHBOARD ROUTE CHECK ====================

  const isDashboardRoute =
    location.pathname.startsWith('/admin') ||
    location.pathname === '/exhibitor' ||
    location.pathname.startsWith('/exhibitor/')

  return (
    <ToastProvider>
    <NotificationProvider>
      <>
        <ScrollToTop />

        {/* ==================== PUBLIC HEADER ==================== */}

        {!isDashboardRoute && (
          <>
            <TopBar />
            <Navbar />
          </>
        )}

        {/* ==================== ROUTES ==================== */}

        <Routes>

          {/* ================================================== */}
          {/* PUBLIC WEBSITE */}
          {/* ================================================== */}

          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

          <Route
            path="/notifications"
            element={<Notifications />}
          />

          <Route
            path="/events"
            element={<Events />}
          />

          <Route
            path="/events/:id"
            element={<PublicEventDetails />}
          />

          <Route
            path="/exhibitors"
            element={<Exhibitors />}
          />

          <Route
            path="/exhibitors/:id"
            element={<ExhibitorDetails />}
          />

          <Route
            path="/contact"
            element={<Contact />}
          />

          <Route
            path="/about"
            element={<About />}
          />

          <Route
            path="/dashboard"
            element={<Home />}
          />

          {/* ================================================== */}
          {/* AUTH */}
          {/* ================================================== */}

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          <Route
            path="/reset-password"
            element={<ResetPassword />}
          />

          <Route
            path="/reset-password/:token"
            element={<ResetPassword />}
          />

          {/* ================================================== */}
          {/* ADMIN DASHBOARD */}
          {/* ================================================== */}

          <Route
            path="/admin"
            element={<DashboardLayout />}
          >

            {/* /admin → /admin/dashboard */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            <Route
              path="dashboard"
              element={<AdminDashboard />}
            />

            <Route
              path="events"
              element={<AdminEvents />}
            />

            <Route
              path="events/create"
              element={<CreateEvent />}
            />

            <Route
              path="events/:id/edit"
              element={<EditEvent />}
            />

            <Route
              path="events/:id"
              element={<EventDetails />}
            />

            <Route
              path="exhibitors"
              element={<AdminExhibitors />}
            />

            <Route
              path="booths"
              element={<AdminBooths />}
            />

            <Route
              path="sessions"
              element={<AdminSessions />}
            />

            <Route
              path="registrations"
              element={<AdminRegistrations />}
            />

            <Route
              path="analytics"
              element={<AdminAnalytics />}
            />

            <Route
              path="messages"
              element={<AdminMessages />}
            />

            <Route
              path="contact-messages"
              element={<AdminContactMessages />}
            />

            <Route
              path="notifications"
              element={<AdminNotifications />}
            />

            <Route
              path="settings"
              element={<AdminSettings />}
            />

            <Route
              path="profile"
              element={<AdminProfile />}
            />

          </Route>

          {/* ================================================== */}
          {/* SESSIONS / SCHEDULE */}
          {/* ================================================== */}

          <Route
            path="/sessions"
            element={<Schedule />}
          />

          <Route
            path="/schedule"
            element={<Schedule />}
          />

          {/* ================================================== */}
          {/* EXHIBITOR DASHBOARD */}
          {/* ================================================== */}

          <Route
            path="/exhibitor"
            element={<DashboardLayout />}
          >

            {/* /exhibitor → /exhibitor/dashboard */}

            <Route
              index
              element={
                <Navigate
                  to="dashboard"
                  replace
                />
              }
            />

            {/* Exhibitor Dashboard */}

            <Route
              path="dashboard"
              element={<ExhibitorDashboard />}
            />

            {/* Exhibitor Profile */}

            <Route
              path="profile"
              element={<ExhibitorProfile />}
            />

            {/* Exhibitor Events */}

            <Route
              path="events"
              element={<ExhibitorEvents />}
            />

            {/* Event Details */}

            <Route
              path="events/:id"
              element={<ExhibitorEventDetails />}
            />

            {/* Event Products */}

            <Route
              path="events/:id/products"
              element={<EventProducts />}
            />

            {/* Applications */}

            <Route
              path="applications"
              element={<ExhibitorApplications />}
            />

            {/* Booths */}

            <Route
              path="booths"
              element={<ExhibitorBooths />}
            />

            {/* All Products */}

            <Route
              path="products"
              element={<ExhibitorProducts />}
            />

            {/* Messages */}

            <Route
              path="messages"
              element={<ExhibitorMessages />}
            />

            {/* Notifications */}

            <Route
              path="notifications"
              element={<ExhibitorNotifications />}
            />

          </Route>

          {/* ================================================== */}
          {/* 404 */}
          {/* ================================================== */}

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

        </Routes>

        {/* ==================== PUBLIC FOOTER ==================== */}

        {!isDashboardRoute && <Footer />}

        {!isDashboardRoute && <ChatWidget />}

      </>
    </NotificationProvider>
    </ToastProvider>
  )
}

export default App
