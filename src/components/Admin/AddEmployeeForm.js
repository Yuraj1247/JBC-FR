import React, { useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { toast } from 'react-toastify';

function AddEmployeeForm({ onEmployeeAdded }) {
  const [newEmployee, setNewEmployee] = useState({
    name: '',
    mobileNumber: '',
    designation: '',
    email: '',
    profilePicture: null
  });

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', newEmployee.name);
    formData.append('mobileNumber', newEmployee.mobileNumber);
    formData.append('designation', newEmployee.designation);
    formData.append('email', newEmployee.email);
    if (newEmployee.profilePicture) {
      formData.append('profilePicture', newEmployee.profilePicture);
    }

    try {
      const response = await axiosInstance.post('/api/admin/employees', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data) {
        // Callback to parent component to update employee list
        if (onEmployeeAdded) {
          onEmployeeAdded(response.data.employee);
        }
        
        // Reset form
        setNewEmployee({
          name: '',
          mobileNumber: '',
          designation: '',
          email: '',
          profilePicture: null
        });

        toast.success('Employee added successfully');
      }
    } catch (error) {
      console.error('Error adding employee', error);
      toast.error(`Failed to add employee: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="add-employee">
      <h3>Add New Employee</h3>
      <form onSubmit={handleAddEmployee}>
        <input 
          type="text" 
          placeholder="Name" 
          value={newEmployee.name}
          onChange={(e) => setNewEmployee({...newEmployee, name: e.target.value})}
          required 
        />
        <input 
          type="tel" 
          placeholder="Mobile Number" 
          value={newEmployee.mobileNumber}
          onChange={(e) => setNewEmployee({...newEmployee, mobileNumber: e.target.value})}
          required 
        />
        <input 
          type="text" 
          placeholder="Designation" 
          value={newEmployee.designation}
          onChange={(e) => setNewEmployee({...newEmployee, designation: e.target.value})}
          required 
        />
        <input 
          type="email" 
          placeholder="Email" 
          value={newEmployee.email}
          onChange={(e) => setNewEmployee({...newEmployee, email: e.target.value})}
          required 
        />
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setNewEmployee({...newEmployee, profilePicture: e.target.files[0]})}
        />
        <button type="submit">Add Employee</button>
      </form>
    </div>
  );
}

export default AddEmployeeForm;
