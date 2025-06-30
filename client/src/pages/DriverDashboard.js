
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DriverDashboard.css';

const DriverDashboard = () => {
  const [vehicle, setVehicle] = useState(null);
  const [students, setStudents] = useState([]);
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  const driverEmail = JSON.parse(localStorage.getItem('user'))?.email;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/driver/dashboard/${driverEmail}`);
        setVehicle(res.data.vehicle);
        console.log(res.data.students);
        setStudents(res.data.students);
      } catch (err) {
        console.error('Error fetching driver dashboard:', err);
      }
    };

    fetchDashboard();
  }, [driverEmail]);

  const handleStartRide = async () => {
    const confirmed = window.confirm('Start the ride? This will lock the vehicle for current route.');
    if (confirmed) {
      await axios.post('http://localhost:5050/api/driver/start-ride', { driverEmail });
      alert('Ride started!');
      setShowAddPrompt(true);
    }
  };

  const handleCompleteRide = async () => {
    await axios.post('http://localhost:5050/api/driver/complete-ride', { driverEmail });
    alert('Ride marked as complete.');
    window.location.reload();
  };

  const handleAddMore = async (accept) => {
    setShowAddPrompt(false);
    if (accept) {
      await axios.post('http://localhost:5050/api/driver/accept-more', { driverEmail });
      alert('New students added from other locations.');
      window.location.reload();
    } else {
      alert('Continuing without additional pickups.');
    }
  };

  const handlePickup = async (studentId) => {
    const otp = prompt('Enter OTP to verify pickup:');
    if (!otp) return;
    try {
      await axios.post('http://localhost:5050/api/driver/pickup-student', {
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
      await axios.post('http://localhost:5050/api/driver/drop-student', {
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
      await axios.post('http://localhost:5050/api/driver/no-show', { studentId });
      alert('Marked as no show.');
      refreshDashboard();
    } catch (err) {
      alert('Error marking no show.');
    }
  };

  const refreshDashboard = async () => {
    const res = await axios.get(`http://localhost:5050/api/driver/dashboard/${driverEmail}`);
    setVehicle(res.data.vehicle);
    setStudents(res.data.students);
  };

  const groupByLocation = () => {
    const grouped = {};
    students.forEach((student) => {
      if (!grouped[student.pickup_location]) {
        grouped[student.pickup_location] = [];
      }
      grouped[student.pickup_location].push(student);
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

          <h3>🧑‍🎓 Assigned Students</h3>
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

          <div className="action-buttons">
            <button onClick={handleStartRide}>Start Ride</button>
            <button onClick={handleCompleteRide}>Complete Ride</button>
          </div>

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
