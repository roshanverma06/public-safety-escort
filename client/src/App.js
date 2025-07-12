

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import BookRide from './pages/BookRide';
import QueueStatus from './pages/QueueStatus';
import OTP from './pages/OTP';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import RideConfirmation from './pages/RideConfirmation';
import TrackRide from './pages/TrackRide';
import DriverHistory from './pages/DriverHistory';
import DriverLogin from './pages/DriverLogin';
import AdminLogin from './pages/AdminLogin';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver-login" element={<DriverLogin />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/book-ride" element={<ProtectedRoute allowedRoles={['student']} ><BookRide /></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute allowedRoles={['student']}><TrackRide /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ProtectedRoute allowedRoles={['student']}><ForgotPassword /></ProtectedRoute>} />
        <Route path="/ride-confirmation" element={<ProtectedRoute allowedRoles={['student']}><RideConfirmation /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute allowedRoles={['driver']}> <DriverDashboard /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute allowedRoles={['driver']}><DriverHistory /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />

      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

