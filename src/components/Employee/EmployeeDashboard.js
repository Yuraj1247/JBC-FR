import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';
import axiosInstance from '../../config/axiosConfig';
import defaultProfilePicture from '../../assets/default-profile.png';


function EmployeeDashboard() {
  const [profile, setProfile] = useState(null);
  const [attendanceData, setAttendanceData] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState({
    totalPresentDays: 0,
    totalAdvanceAmount: 0,
    position: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const print = () => {
    window.print();
  };

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/employee/dashboard');
        const { profile, attendanceRecords, monthlySummary } = response.data;
        setProfile(profile);
        setAttendanceData(attendanceRecords);
        setMonthlySummary({
          totalPresentDays: monthlySummary.totalPresentDays,
          totalAdvanceAmount: monthlySummary.totalAdvanceAmount,
          position: null
        });
        setLoading(false);
        setError(null);
      } catch (error) {
        console.error('Error fetching employee data', error);
        setError(`Failed to load employee data: ${error.response?.data?.message || error.message}`);
        setLoading(false);
      }
    };

    const token = localStorage.getItem('employeeToken');
    if (!token) {
      setError('No authentication token found. Please log in.');
      setLoading(false);
      return;
    }

    fetchEmployeeData();
  }, []);

  useEffect(() => {
    gsap.from('.employee-dashboard', { opacity: 0, duration: 1, y: -50, ease: 'power3.out' });
    gsap.from('.profile-section', { opacity: 0, scale: 0.8, duration: 1.2, delay: 0.5, ease: 'elastic.out(1, 0.5)' });
    gsap.from('.attendance-table table tr', { opacity: 0, y: 20, stagger: 0.2, duration: 1, ease: 'power2.out' });
    gsap.from('.monthly-summary p', { opacity: 0, x: -20, stagger: 0.2, duration: 1, ease: 'power2.out' });
  }, []);

  if (loading) return <div className='loading-bar'>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;
  if (!profile) return <div>No profile data available</div>;

  const getProfilePicture = (profilePicture) => {
    if (!profilePicture) {
      return '/uploads/profile-pictures/default-profile.png';
    }
    if (profilePicture.startsWith('http') || profilePicture.startsWith('/')) {
      return profilePicture;
    }
    return `/uploads/profile-pictures/${profilePicture}`;
  };

  const profilePicture = getProfilePicture(profile.profilePicture);

  const handleLogout = () => {
    localStorage.removeItem('employeeToken');
    window.location.href = ('/employee/login');
  };

  return (
    <div className="employee-dashboard ">
      <div className="title-container">
      <h2>Hii,<strong>{profile.name}</strong></h2>
      <button onClick={handleLogout} className="logout-btn">Logout</button></div>
      <div className="profile-section main-color">
        <h3>Profile Details</h3>
        <hr></hr>
        <div className="profile-details">
        <div className="profile-picture-container">
          <img src={profilePicture} alt={`${profile.name}'s profile`} className="profile-picture" onError={(e) => { e.target.src = defaultProfilePicture; }} />
        </div>
        <div className="profile-info">
          <p>Name: {profile.name}</p>
          <p>Mobile Number: {profile.mobileNumber}</p>
          <p>Designation: {profile.designation}</p>
          <p>Email: {profile.email}</p>
        </div></div>
      </div>
      <div className="attendance-table main-color">
        <h3>Attendance Details</h3><hr></hr>
        <table>
          <thead>
            <tr>
              {/* <th>Sr No</th> */}
              <th>Date</th>
              <th>Status</th>
              <th>Advance Amount</th>
              <th>Site Name</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((record, index) => (
              <tr key={index}>
                {/* <td>{index + 1}</td> */}
                <td>{new Date(record.date).toLocaleDateString()}</td>
                <td>{record.status || 'NA'}</td>
                <td>₹ {record.advanceAmount || 0}</td>
                <td>{record.siteName || 'NA'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="monthly-summary main-color">
        <h3><strong>Monthly Summary</strong></h3><hr></hr>
        <p>Total Present Days: <strong>{monthlySummary.totalPresentDays}</strong> </p>
        <p>Total Advance Amount: <strong>₹ {monthlySummary.totalAdvanceAmount}</strong></p>
        {/* <p>Your Position: {monthlySummary.position || 'Not Ranked'}</p> */}
        <button onClick={print} className="print-btn">Print</button>
      </div>
    </div>
  );
}

export default EmployeeDashboard;
