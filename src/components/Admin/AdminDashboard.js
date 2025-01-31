import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import AddEmployeeForm from './AddEmployeeForm';
import ManageEmployees from './ManageEmployees';
import AddSite from './AddSite';
import UpdateAttendance from './UpdateAttendance';

function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('addEmployee');
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if admin is authenticated
    const token = localStorage.getItem('adminToken');
    if (!token) {
      // Redirect to login if no token
      navigate('/admin/login');
      return;
    }

    // Fetch dashboard summary
    const fetchDashboardSummary = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/dashboard-summary');
        if (response.data.success) {
          setDashboardSummary(response.data.summary);
        } else {
          setError('Failed to fetch dashboard summary');
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard summary', error);
        setError('Failed to fetch dashboard summary');
        setLoading(false);
      }
    };

    fetchDashboardSummary();
  }, [navigate]);

  const handleLogout = () => {
    // Remove admin token and redirect to login
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  const renderActiveSection = () => {
    switch(activeSection) {
      case 'addEmployee':
        return <AddEmployeeForm />;
      case 'manageEmployees':
        return <ManageEmployees />;
      case 'addSite':
        return <AddSite />;
      case 'updateAttendance':
        return <UpdateAttendance />;
      default:
        return <AddEmployeeForm />;
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      {/* Dashboard Summary */}
      <div className="dashboard-summary">
        <div className="summary-card">
          <h3>Total Employees</h3>
          <p>{dashboardSummary.totalEmployees}</p>
        </div>
        <div className="summary-card">
          <h3>Total Sites</h3>
          <p>{dashboardSummary.totalSites}</p>
        </div>
        {/* <div className="summary-card">
          <h3>Recent Employees</h3>
          <ul>
            {dashboardSummary.recentEmployees.map((employee) => (
              <li key={employee._id}>
                {employee.name} - {employee.designation}
              </li>
            ))}
          </ul>
        </div> */}
      </div>

      <div className="admin-navigation">
        <button 
          className={activeSection === 'addEmployee' ? 'active' : ''}
          onClick={() => setActiveSection('addEmployee')}
        >
          Add Employee
        </button>
        <button 
          className={activeSection === 'manageEmployees' ? 'active' : ''}
          onClick={() => setActiveSection('manageEmployees')}
        >
          Manage Employees
        </button>
        <button 
          className={activeSection === 'addSite' ? 'active' : ''}
          onClick={() => setActiveSection('addSite')}
        >
          Add Site
        </button>
        <button 
          className={activeSection === 'updateAttendance' ? 'active' : ''}
          onClick={() => setActiveSection('updateAttendance')}
        >
          Update Attendance
        </button>
      </div>

      <div className="admin-content">
        {renderActiveSection()}
      </div>
    </div>
  );
}

export default AdminDashboard;
