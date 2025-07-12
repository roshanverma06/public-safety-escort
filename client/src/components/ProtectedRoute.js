import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

// // components/ProtectedRoute.js
// // import React from 'react';
// // import { Navigate } from 'react-router-dom';

// // const ProtectedRoute = ({ children, allowedRoles = [] }) => {
// //   const user = JSON.parse(localStorage.getItem('user'));

// //   // ❌ Not logged in
// //   if (!user) {
// //     return <Navigate to="/" replace />;
// //   }

// //   // ❌ Role not authorized
// //   if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
// //     return <Navigate to="/" replace />;
// //   }

// //   // ✅ Authorized
// //   return children;
// // };

// // export default ProtectedRoute;

// // import React from 'react';
// // import { Navigate } from 'react-router-dom';

// // const ProtectedRoute = ({ children, role }) => {
// //   const user = JSON.parse(localStorage.getItem('user'));

// //   if (!user || user.role !== role) {
// //     // Redirect based on required role
// //     switch (role) {
// //       case 'student':
// //         return <Navigate to="/" replace />;
// //       case 'driver':
// //         return <Navigate to="/driver-login" replace />;
// //       case 'admin':
// //         return <Navigate to="/admin-login" replace />;
// //       default:
// //         return <Navigate to="/" replace />;
// //     }
// //   }

// //   return children;
// // };

// // export default ProtectedRoute;



// import React from 'react';
// import { Navigate, useLocation } from 'react-router-dom';

// const ProtectedRoute = ({ children, allowedRoles }) => {
//   const location = useLocation();
//   const user = JSON.parse(localStorage.getItem('user'));

//   if (!user) {
//     // Redirect to login based on attempted URL path
//     if (location.pathname.startsWith('/admin')) return <Navigate to="/admin-login" replace />;
//     if (location.pathname.startsWith('/driver')) return <Navigate to="/driver-login" replace />;
//     return <Navigate to="/" replace />;
//   }

//   // If user is logged in but role is not allowed, redirect
//   if (allowedRoles && !allowedRoles.includes(user.role)) {
//     return <Navigate to="/" replace />;
//   }

//   return children;
// };

// export default ProtectedRoute;
