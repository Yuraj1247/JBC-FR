import React, {useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../config/axiosConfig';
import { toast } from 'react-toastify';

function EmployeeLogin() {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  
  const sendOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/employee/login/initiate', { mobileNumber });
      if (response.data) {
        setOtpSent(true);
        setError(null);
        toast.success(`OTP sent to ${response.data.email}`);
      } else {
        setError('Failed to send OTP');
      }
    } catch (error) {
      console.error('OTP send error', error);
      setError(error.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOTP = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post('/api/employee/login/verify', { 
        mobileNumber, 
        otp 
      });
      
      if (response.data.token) {
        // Store token in localStorage
        localStorage.setItem('employeeToken', response.data.token);
        navigate('/employee/dashboard');
      } else {
        setError('Invalid OTP');
      }
    } catch (error) {
      console.error('OTP verification error', error);
      setError(error.response?.data?.message || 'OTP verification failed');
    }
  };

  return (
  
    <div className="employee-login">
      <h2>Employee Login</h2>
      {error && <div className="error-message" style={{color: 'red'}}>{error}</div>}
      
      {!otpSent ? (
        <form onSubmit={sendOTP}>
          <input 
            type="tel" 
            placeholder="10 Digit Mobile Number" 
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            pattern="[0-9]{10}"
            required 
          />
          <button type="submit">Send OTP</button>

        </form>
      ) : (
        <form onSubmit={verifyOTP}>
          <input 
            type="text" 
            placeholder="Enter 6 Digit OTP" 
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            pattern="[0-9]{6}"
            required 
          />
          <button type="submit">Verify OTP</button>
          <button type="button" onClick={() => {
            setOtpSent(false);
            setError(null);
          }}>
            Change Mobile Number
          </button>
        </form>
      )}
    </div>
  );
}

export default EmployeeLogin;
