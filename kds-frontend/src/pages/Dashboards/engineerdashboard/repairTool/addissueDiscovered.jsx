// src/components/EditReceptionForm.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const EditReceptionForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    receivedTool: '',
    plate: '',
    owner: '',
    phoneNumber: '',
    issueDiscovered: '',
    issueSolved: ''
  });

  useEffect(() => {
    fetchReception();
  }, []);

  const fetchReception = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/reception-form/get-reception-form/${id}`);
      const data = res.data;
      setFormData({
        receivedTool: data.receivedTool || '',
        plate: data.plate || '',
        owner: data.owner || '',
        phoneNumber: data.phoneNumber || '',
        issueDiscovered: data.issueDiscovered || '',
        issueSolved: data.issueSolved || ''
      });
    } catch (error) {
      console.error('Failed to fetch reception data:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/reception-form/${id}`, formData);
      alert('Reception data updated successfully!');
      navigate('/reception-list');
    } catch (error) {
      console.error('Error updating reception form:', error);
    }
  };

  return (
    <div className="edit-form-container">
      <h2>Edit Reception Record</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>Received Tool:</label>
        <input name="receivedTool" value={formData.receivedTool} onChange={handleChange} />

        <label>Plate:</label>
        <input name="plate" value={formData.plate} onChange={handleChange} />

        <label>Owner:</label>
        <input name="owner" value={formData.owner} onChange={handleChange} />

        <label>Phone Number:</label>
        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} />

        <label>Issue Discovered:</label>
        <textarea name="issueDiscovered" value={formData.issueDiscovered} onChange={handleChange}></textarea>

        <label>Issue Solved:</label>
        <textarea name="issueSolved" value={formData.issueSolved} onChange={handleChange}></textarea>

        <button type="submit" style={{ marginTop: '10px' }}>Update</button>
      </form>
    </div>
  );
};

export default EditReceptionForm;
