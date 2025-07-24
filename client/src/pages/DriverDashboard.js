
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DriverDashboard.css';
import DriverLiveView from './DriverLiveView';
const backendURL = process.env.REACT_APP_BACKEND_URL;


const DriverDashboard = () => {
  const [vehicle, setVehicle] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  const driverEmail = JSON.parse(localStorage.getItem('user'))?.email;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/driver/dashboard/${driverEmail}`);
        setVehicle(res.data.vehicle);
        console.log(res.data.students);
        setStudents(res.data.students);
      } catch (err) {
        console.error('Error fetching driver dashboard:', err);
      }
    };

    fetchDashboard();
  }, [driverEmail]);


  const handleAddMore = async (accept) => {
    setShowAddPrompt(false);
    if (accept) {
      try {
        await axios.post('${backendURL}/api/driver/accept-more', { driverEmail });
        alert('New students added from other locations.');
        window.location.reload();
      } catch (err) {
        console.error('🔥 Error in handleAddMore:', err.response?.data || err.message);
      }
    } else {
      alert('Continuing without additional pickups.');
    }
  };
  

  const handlePickup = async (studentId) => {
    const otp = prompt('Enter OTP to verify pickup:');
    if (!otp) return;
    try {
      await axios.post('${backendURL}/api/driver/pickup-student', {
        studentId,
        enteredOtp: otp
      });
      alert('Student picked up!');
      refreshDashboard();
    } catch (err) {
      alert('OTP incorrect or error picking up student.');
    }
  };

  const handleDrop = async (studentId) => {
    const otp = prompt('Enter OTP to verify drop:');
    if (!otp) return;
    try {
      await axios.post('${backendURL}/api/driver/drop-student', {
        studentId,
        enteredOtp: otp
      });
      alert('Student dropped!');
      refreshDashboard();
    } catch (err) {
      alert('OTP incorrect or error dropping student.');
    }
  };

  const handleNoShow = async (studentId) => {
    const confirmed = window.confirm('Mark this student as no show?');
    if (!confirmed) return;
    try {
      await axios.post('${backendURL}/api/driver/no-show', { studentId });
      alert('Marked as no show.');
      refreshDashboard();
    } catch (err) {
      alert('Error marking no show.');
    }
  };

  const refreshDashboard = async () => {
    const res = await axios.get(`${backendURL}/api/driver/dashboard/${driverEmail}`);
    setVehicle(res.data.vehicle);
    setStudents(res.data.students);
  };

  const [ridePhase, setRidePhase] = useState('confirm'); // confirm → start → complete

const handleMultiAction = async () => {
  // 🔐 Check if all OTPs are verified
  const allVerified = students.every(s => s.status === 'picked_up');
  const allReVerified = students.every(s => s.status === 'dropped');

  if (!allVerified) {
    alert('❌ Please verify all the student OTPs.');
    return;
  }
  

  if (ridePhase === 'confirm') {
    // 🔁 Ask if driver wants to add more students
    const res = await axios.get(`${backendURL}/api/driver/waiting-students/${driverEmail}`);
    // const { location, count } = res.data;
    const { count } = res.data;

    if (count > 0 && vehicle.remaining > 0) {
      setShowAddPrompt(true);
      
    }

    setRidePhase('start');

  } else if (ridePhase === 'start') {
    await axios.post(`${backendURL}/api/driver/start-ride`, { driverEmail });
    alert('✅ Ride Started');
    setRidePhase('complete');

  } else if (ridePhase === 'complete') {
    if (!allReVerified) {
      alert('❌ Please drop all the students.');
      return;
    }
    await axios.post(`${backendURL}/api/driver/complete-ride`, { driverEmail });
    alert('✅ Ride Completed');
    window.location.reload();
  }
};


  const groupByLocation = () => {
    const grouped = {};
    students.forEach((student) => {
      if (!grouped[student.pickup_location_id]) {
        grouped[student.pickup_location_id] = [];
      }
      grouped[student.pickup_location_id].push(student);
    });
    return grouped;
  };

  return (
    <div className="driver-dashboard-container">
      <h2>🚘 Driver Dashboard</h2>

      {vehicle ? (
        <>
          <div className="vehicle-info">
            <p><strong>Vehicle Reg:</strong> {vehicle.vehicleNumber}</p>
            <p><strong>Remaining Capacity:</strong> {vehicle.remaining}/{vehicle.capacity}</p>
          </div>
                {/* 2. Conditionally render the DriverLiveView component */}
      {vehicle ? (
        <DriverLiveView vehicle={vehicle} />
      ) : (
        <p>No vehicle information available.</p>
      )}

      <hr style={{ margin: '2rem 0' }} />

          <h3>🧑‍🎓 Assigned Students</h3>
          {students.length === 0 ? (
            <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>🚫 No students assigned yet.</p>
          ) : (
            <>
              {Object.entries(groupByLocation()).map(([location, studentsList]) => (
                <div key={location} className="students-group">
                  <h4>📍 Pickup Location: {location}</h4>
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Drop Location</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsList.map((s) => (
                        <tr key={s.id}>
                          <td>{s.student_name}</td>
                          <td>{s.drop_location}</td>
                          <td>
                            {s.status === 'assigned' && (
                              <>
                                <button onClick={() => handlePickup(s.id)}>Pickup</button>
                                <button onClick={() => handleNoShow(s.id)}>No Show</button>
                              </>
                            )}
                            {s.status === 'picked_up' && (
                              <button onClick={() => handleDrop(s.id)}>Drop</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}

            </>  
          )}
          {vehicle.status !== 'available' && (
                <div className="action-buttons">
                  <button onClick={handleMultiAction}>
                    {ridePhase === 'confirm' ? 'Confirm Pickup' :
                    ridePhase === 'start'   ? 'Start Ride' :
                    'Complete Ride'}
                  </button>
                </div>
              )}

        


          {showAddPrompt && (
            <div className="add-popup">
              <p>🚕 Want to pick up students from other locations?</p>
              <button onClick={() => handleAddMore(true)}>Yes</button>
              <button onClick={() => handleAddMore(false)}>No</button>
            </div>
          )}
        </>
      ) : (
        <p>Loading dashboard...</p>
      )}
    </div>
  );
};

export default DriverDashboard;

