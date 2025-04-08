import React, { useState } from "react";
import axios from "axios";

const PumpForm = () => {
  const [date, setDate] = useState("");
  const [pumpNumber, setPumpNumber] = useState("");
  const [pumpName, setPumpName] = useState("");
  const [parts, setParts] = useState([{ name: "", quantity: "" }]);
  const [technician, setTechnician] = useState("");
  const [operation, setOperation] = useState("");

  const addPartField = () => {
    setParts([...parts, { name: "", quantity: "" }]);
  };

  const handlePartChange = (index, event) => {
    const newParts = [...parts];
    newParts[index][event.target.name] = event.target.value;
    setParts(newParts);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { date, pumpNumber, pumpName, parts, technician, operation };
    
    try {
      await axios.post("http://localhost:5000/api/pumps", formData);
      alert("Pump data saved successfully");
    } catch (error) {
      console.error("Error saving pump data", error);
    }
  };

  return (
    <div className="pump-form-container">
      <h2>Register Pump Maintenance</h2>
      <form onSubmit={handleSubmit}>
        <label>Date:</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <label>Pump Number:</label>
        <input type="text" value={pumpNumber} onChange={(e) => setPumpNumber(e.target.value)} required />

        <label>Pump Name:</label>
        <input type="text" value={pumpName} onChange={(e) => setPumpName(e.target.value)} required />

        <h3>Pump Parts</h3>
        {parts.map((part, index) => (
          <div key={index} className="part-field">
            <input
              type="text"
              name="name"
              placeholder="Part Name"
              value={part.name}
              onChange={(e) => handlePartChange(index, e)}
              required
            />
            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={part.quantity}
              onChange={(e) => handlePartChange(index, e)}
              required
            />
          </div>
        ))}
        <button type="button" onClick={addPartField}>Add Part</button>

        <label>Technician Name:</label>
        <input type="text" value={technician} onChange={(e) => setTechnician(e.target.value)} required />

        <label>Operation Done:</label>
        <textarea value={operation} onChange={(e) => setOperation(e.target.value)} required />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default PumpForm;
