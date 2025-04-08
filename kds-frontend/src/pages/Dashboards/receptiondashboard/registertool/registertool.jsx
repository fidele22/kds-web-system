import React, { useState } from 'react';
import axios from 'axios';
import './receptionform.css'; // Optional styling

const FuelForm = () => {
  const [formData, setFormData] = useState({
    date: '',
    timeOfOperation: '',
    pumpNumber: '',
    licensePlate: '',
    operationStatus: '',
    entryTime: '',
    returnTime: '',
    returnDetails: ''
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/fuel/create', formData);
      alert('Data saved successfully');
      setFormData({
        date: '',
        timeOfOperation: '',
        pumpNumber: '',
        licensePlate: '',
        operationStatus: '',
        entryTime: '',
        returnTime: '',
        returnDetails: ''
      });
    } catch (err) {
      console.error(err);
      alert('Failed to save data');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="fuel-form">
      <h2>Record Fuel Operation</h2>

      <label>Date</label>
      <input type="date" name="date" value={formData.date} onChange={handleChange} required />

      <label>Time of Operation</label>
      <input type="text" name="timeOfOperation" value={formData.timeOfOperation} onChange={handleChange} required />

      <label>Number of Pump</label>
      <input type="text" name="pumpNumber" value={formData.pumpNumber} onChange={handleChange} required />

      <label>License Plate</label>
      <input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} required />

      <label>Operation Status</label>
      <input type="text" name="operationStatus" value={formData.operationStatus} onChange={handleChange} required />

      <label>Entry Time</label>
      <input type="time" name="entryTime" value={formData.entryTime} onChange={handleChange} required />

      <label>Return Time</label>
      <input type="time" name="returnTime" value={formData.returnTime} onChange={handleChange} required />

      <label>Return & Refund Details</label>
      <input type="text" name="returnDetails" value={formData.returnDetails} onChange={handleChange} required />

      <button type="submit">Submit</button>
    </form>
  );
};

export default FuelForm;
