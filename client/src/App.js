

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Login from './pages/Login';
import BookRide from './pages/BookRide';
import QueueStatus from './pages/QueueStatus';
import OTP from './pages/OTP';
import DriverDashboard from './pages/DriverDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
    <Header />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/book-ride" element={<BookRide />} />
        <Route path="/queue-status" element={<QueueStatus />} />
        <Route path="/otp" element={<OTP />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}

export default App;

