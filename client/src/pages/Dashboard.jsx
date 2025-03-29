import { LogOut } from 'lucide-react'
import React from 'react'
import axiosInstance from '../utils/axiosInstance'

export const Dashboard = () => {
  const handleLogout = async () => {
    try {
      await axiosInstance.post('/logout');
      window.location.href = "/login";
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  return (
    <div>Dashboard
      <span onClick={handleLogout}><LogOut/></span>
    </div>
  )
}
