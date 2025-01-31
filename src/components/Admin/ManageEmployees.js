import React, { useState, useEffect } from 'react';
import axiosInstance from '../../config/axiosConfig';
import defaultProfilePicture from '../../assets/default-profile.png';
import { toast } from 'react-toastify';

function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [profilePictureFile, setProfilePictureFile] = useState(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/api/admin/employees');
      setEmployees(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching employees', error);
      setError('Failed to fetch employees');
      setLoading(false);
    }
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee({...employee});
  };

  const handleUpdateEmployee = async (e) => {
    e.preventDefault();
    try {
      // Prepare form data for upload
      const formData = new FormData();
      
      // Append employee details
      formData.append('name', editingEmployee.name);
      formData.append('mobileNumber', editingEmployee.mobileNumber);
      formData.append('email', editingEmployee.email);
      formData.append('designation', editingEmployee.designation);

      // Append profile picture if selected
      if (profilePictureFile) {
        formData.append('profilePicture', profilePictureFile);
      }

      // Send update request
      const response = await axiosInstance.put(
        `/api/admin/employees/${editingEmployee._id}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Update employees list
      const updatedEmployees = employees.map(emp => 
        emp._id === editingEmployee._id ? response.data.employee : emp
      );
      setEmployees(updatedEmployees);

      // Reset editing state
      setEditingEmployee(null);
      setProfilePictureFile(null);
    } catch (error) {
      console.error('Error updating employee', error);
      toast.error(`Failed to update employee: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image (JPEG, PNG, GIF, or WebP)');
        return;
      }

      if (file.size > maxSize) {
        toast.error('File size should be less than 5MB');
        return;
      }

      // Set file for upload and create preview
      setProfilePictureFile(file);
      
      // Create a local preview URL
      const previewUrl = URL.createObjectURL(file);
      
      // Update editing employee with preview URL
      setEditingEmployee(prev => ({
        ...prev,
        profilePicture: previewUrl
      }));
    }
  };

  const handleDeleteEmployee = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await axiosInstance.delete(`/api/admin/employees/${employeeId}`);
        setEmployees(employees.filter(emp => emp._id !== employeeId));
      } catch (error) {
        console.error('Error deleting employee', error);
        toast.error(`Failed to delete employee: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="manage-employees">
      <h2>Manage Employees</h2>
      
      {editingEmployee ? (
        <div className="edit-employee-form">
          <h3>Edit Employee</h3>
          <form onSubmit={handleUpdateEmployee}>
            <div className="profile-picture-upload">
              <div 
                className="profile-picture-container" 
                style={{
                  width: '150px', 
                  height: '150px', 
                  borderRadius: '50%', 
                  overflow: 'hidden', 
                  margin: '0 auto'
                }}
              >
                <img 
                  src={editingEmployee.profilePicture || defaultProfilePicture} 
                  alt="Profile" 
                  style={{
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = defaultProfilePicture;
                  }}
                />
              </div>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleProfilePictureChange}
              />
            </div>

            <input 
              type="text" 
              placeholder="Name" 
              value={editingEmployee.name || ''}
              onChange={(e) => setEditingEmployee(prev => ({
                ...prev, 
                name: e.target.value
              }))}
              required 
            />
            <input 
              type="tel" 
              placeholder="Mobile Number" 
              value={editingEmployee.mobileNumber || ''}
              onChange={(e) => setEditingEmployee(prev => ({
                ...prev, 
                mobileNumber: e.target.value
              }))}
              required 
            />
            <input 
              type="email" 
              placeholder="Email" 
              value={editingEmployee.email || ''}
              onChange={(e) => setEditingEmployee(prev => ({
                ...prev, 
                email: e.target.value
              }))}
              required 
            />
            <input 
              type="text" 
              placeholder="Designation" 
              value={editingEmployee.designation || ''}
              onChange={(e) => setEditingEmployee(prev => ({
                ...prev, 
                designation: e.target.value
              }))}
              required 
            />

            <div className="form-actions gap">
              <button type="submit">Update Employee</button>
              <button 
                type="button" 
                onClick={() => {
                  setEditingEmployee(null);
                  setProfilePictureFile(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Profile</th>
              <th>Name</th>
              <th>Mobile Number</th>
              <th>Designation</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee._id}>
                <td>
                  <div 
                    className="profile-picture-container" 
                    style={{
                      width: '50px', 
                      height: '50px', 
                      borderRadius: '50%', 
                      overflow: 'hidden'
                    }}
                  >
                    <img 
                      src={employee.profilePicture || defaultProfilePicture} 
                      alt={`${employee.name}'s profile`} 
                      style={{
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover'
                      }}
                      onError={(e) => {
                        e.target.src = defaultProfilePicture;
                      }}
                    />
                  </div>
                </td>
                <td>{employee.name}</td>
                <td>{employee.mobileNumber}</td>
                <td>{employee.designation}</td>
                <td className='gap'>
                  <button onClick={() => handleEditEmployee(employee)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteEmployee(employee._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ManageEmployees;
