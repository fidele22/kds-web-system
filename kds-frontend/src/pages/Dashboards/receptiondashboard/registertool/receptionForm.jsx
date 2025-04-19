import React, { useState } from 'react';
import axios from 'axios';
import './receptionform.css';

const ReceptionForm = () => {
  const [formData, setFormData] = useState({
    receivedTool: '',
    receptionNumber: '',
    plate: '',
    issueDescription: [''],
    owner: '',
    phoneNumber: '',
    status: 'Pending',
    image: null
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, image: files[0] });
    } else if (name === 'issueDescription') {
      const lines = value.split('\n').map((line) => line.replace(/^\d+\.\s*/, '')); // remove manual numbering
      setFormData({ ...formData, issueDescription: lines });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const getFormattedIssueText = () => {
    return formData.issueDescription
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = new FormData();
    payload.append('receivedTool', formData.receivedTool);
    payload.append('receptionNumber', formData.receptionNumber);
    payload.append('plate', formData.plate);
    payload.append('owner', formData.owner);
    payload.append('phoneNumber', formData.phoneNumber);
    payload.append('status', formData.status);
    payload.append('image', formData.image);
    payload.append('issueDescription', JSON.stringify(formData.issueDescription));

    try {
      await axios.post('http://localhost:5000/api/reception-form/send-receptionForm', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('Form submitted successfully!');
      setFormData({
        receivedTool: '',
        receptionNumber: '',
        plate: '',
        issueDescription: [''],
        owner: '',
        phoneNumber: '',
        status: 'Pending',
        image: null
      });
    } catch (err) {
      console.error('Submission error:', err);
      alert('Failed to submit form.');
    }
  };

  return (
    <div className="form-container">
      <h2>Garage Reception Form</h2>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <label>Received Tool:</label>
        <input
          type="text"
          name="receivedTool"
          value={formData.receivedTool}
          onChange={handleInputChange}
          required
        />

        <label>Reception Number:</label>
        <input
          type="text"
          name="receptionNumber"
          value={formData.receptionNumber}
          onChange={handleInputChange}
          required
        />

        <label>Plate Number:</label>
        <input
          type="text"
          name="plate"
          value={formData.plate}
          onChange={handleInputChange}
          required
        />

        <label>Issue Description (auto-numbered):</label>
        <textarea
          name="issueDescription"
          value={getFormattedIssueText()}
          onChange={handleInputChange}
          rows="6"
          placeholder="Describe issues, one per line"
          required
        ></textarea>

        <label>Owner:</label>
        <input
          type="text"
          name="owner"
          value={formData.owner}
          onChange={handleInputChange}
          required
        />

        <label>Phone Number:</label>
        <input
          type="text"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
          required
        />

        <label>Upload Image (Optional):</label>
        <input type="file" name="image" accept="image/*" onChange={handleInputChange} />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default ReceptionForm;
