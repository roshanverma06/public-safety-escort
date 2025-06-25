

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
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/book-ride" element={<ProtectedRoute><BookRide /></ProtectedRoute>} />
        <Route path="/driver" element={<ProtectedRoute> <DriverDashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/forgot-password" element={<ProtectedRoute><ForgotPassword /></ProtectedRoute>} />
        <Route path="/ride-confirmation" element={<ProtectedRoute><RideConfirmation /></ProtectedRoute>} />
        <Route path="/track" element={<ProtectedRoute><TrackRide /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><DriverHistory /></ProtectedRoute>} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

