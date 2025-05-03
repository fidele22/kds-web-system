import React, { useState } from 'react';
import './receptiondata.css';

const AddPaymentOverlay = ({ data, onClose, onPaymentAdded }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!amountPaid || Number(amountPaid) <= 0) {
      newErrors.amountPaid = 'Please enter a valid amount.';
    }
    if (!paymentMethod) {
      newErrors.paymentMethod = 'Please select a payment method.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (data.status !== 'Completed') {
        setErrors({ form: 'You can only add payment info when the task is marked as Completed.' });
        return;
      }
    if (!validate()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/reception-form/payment-info/${data._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amountPaid, paymentMethod }),
      });
        alert('Payment info saved!');
        setAmountPaid(''); 
        setPaymentMethod(''); 
    
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        <h3>Add Payment Info</h3>
        <label>Amount Paid:</label>
        <input
          type="number"
          value={amountPaid}
          onChange={(e) => setAmountPaid(e.target.value)}
        />
           {errors.amountPaid && <p className="error-text">{errors.amountPaid}</p>}
        <label>Payment Method:</label>
        <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
          <option value="">Select</option>
          <option value="Cash">Cash</option>
          <option value="Mobile Money">Mobile Money</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Other">Other</option>
        </select>
        {errors.paymentMethod && <p className="error-text">{errors.paymentMethod}</p>}
        <div className="overlay-actions">
          <button onClick={handleSave}  >Save</button>
          <button onClick={onClose} className="cancel-btn">Cancel</button>
        </div>
        {errors.form && <p className="error-text">{errors.form}</p>}
      </div>
    </div>
  );
};

export default AddPaymentOverlay;
