import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { toast } from 'react-toastify';

function UpdateAttendance() {
  const [employees, setEmployees] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [attendanceRecord, setAttendanceRecord] = useState({
    employeeId: '',
    date: '',
    hazri: '',
    advanceAmount: '',
    advanceReason: '',
    siteName: ''
  });

  useEffect(() => {
    fetchEmployeesAndSites();
  }, []);

  const fetchEmployeesAndSites = async () => {
    try {
      setLoading(true);
      const [employeesResponse, sitesResponse] = await Promise.all([
        axiosInstance.get('/api/admin/employees'),
        axiosInstance.get('/api/admin/sites')
      ]);

      setEmployees(employeesResponse.data);
      setSites(sitesResponse.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching data', error);
      setError(`Failed to fetch employees and sites: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (e) => {
    e.preventDefault();
    try {
      // Validate required fields
      if (!attendanceRecord.employeeId || !attendanceRecord.date || !attendanceRecord.hazri || !attendanceRecord.siteName) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await axiosInstance.post('/api/admin/attendance', {
        ...attendanceRecord,
        // Ensure numeric conversion for advance amount
        advanceAmount: attendanceRecord.advanceAmount ? parseFloat(attendanceRecord.advanceAmount) : 0
      });

      if (response.data) {
        toast.success('Attendance updated successfully');
        // Reset form
        setAttendanceRecord({
          employeeId: '',
          date: '',
          hazri: '',
          advanceAmount: '',
          advanceReason: '',
          siteName: ''
        });
      }
    } catch (error) {
      console.error('Error updating attendance', error);
      toast.error(`Failed to update attendance: ${error.response?.data?.message || error.message}`);
    }
  };

  // Render loading state
  if (loading) {
    return <div>Loading...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="update-attendance">
      <h3>Update Attendance</h3>
      <form onSubmit={handleUpdateAttendance}>
        <select 
          value={attendanceRecord.employeeId}
          onChange={(e) => setAttendanceRecord({...attendanceRecord, employeeId: e.target.value})}
          required
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name} - {employee.mobileNumber}
            </option>
          ))}
        </select>

        <input 
          type="date" 
          value={attendanceRecord.date}
          onChange={(e) => setAttendanceRecord({...attendanceRecord, date: e.target.value})}
          required 
        />

        <select 
          value={attendanceRecord.hazri}
          onChange={(e) => setAttendanceRecord({...attendanceRecord, hazri: e.target.value})}
          required
        >
          <option value="">Select Hazri</option>
          <option value="Present">Present</option>
          <option value="Absent">Absent</option>
          <option value="Half">Half</option>
          <option value="-">-</option>
        </select>

        <select 
          value={attendanceRecord.siteName}
          onChange={(e) => setAttendanceRecord({...attendanceRecord, siteName: e.target.value})}
          required
        >
          <option value="">Select Site</option>
          {sites.map((site) => (
            <option key={site._id} value={site.name}>
              {site.name}
            </option>
          ))}
        </select>

        <input 
          type="number" 
          placeholder="Advance Amount" 
          value={attendanceRecord.advanceAmount}
          onChange={(e) => setAttendanceRecord({...attendanceRecord, advanceAmount: e.target.value})}
        />

        <input 
          type="text" 
          placeholder="Advance Reason" 
          value={attendanceRecord.advanceReason}
          onChange={(e) => setAttendanceRecord({...attendanceRecord, advanceReason: e.target.value})}
        />

        <button type="submit">Update Attendance</button>
      </form>
    </div>
  );
}

export default UpdateAttendance;
