import React, { useState } from 'react';
import axios from 'axios';
import './stockstyling.css';

function AddItem() {
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('image', image);

    try {
        await axios.post('http://localhost:5000/api/stockTool/saveTool',formData,{
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    setName('');
    setImage(null);
    alert('Item added!');
  } catch (error) {
    console.error('Error uploading item:', error);
  }
};
  return (
    <div className="item-container">
      <h2>Add tool in stock</h2>
      <form onSubmit={handleSubmit} className="item-form" encType="multipart/form-data">
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          required
        />
        <button type="submit">Save</button>
      </form>
    </div>
  );
}

export default AddItem;