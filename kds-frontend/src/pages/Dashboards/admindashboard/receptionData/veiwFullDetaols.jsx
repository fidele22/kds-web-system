import React, { useState } from 'react';
import AddPaymentOverlay from './addPaymentInfo'; // adjust path as needed

import './receptiondata.css';

const ReceptionDetailView = ({ data, onBack }) => {
  // ✅ Hooks should be called unconditionally
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // ✅ Then you can do conditional rendering
  if (!data) return <div>No data to show</div>;
 
  return (
    <div className="reception-detail-view">
      <button onClick={onBack} className="back-btn">Go Back</button>
      <button onClick={() => setShowPaymentForm(true)}>Add Payment</button>
      <div className="grid-container">
        <div className="left-column">
          <h3>Reception Info</h3>
          <p><strong>Date:</strong> {new Date(data.createdAt).toLocaleDateString()}</p>
          <p><strong>Received Tool:</strong> {data.receivedTool}</p>
          <p><strong>Tool Number:</strong> {data.receivedToolNumber}</p>
          <p><strong>Plaque:</strong> {data.plate}</p>
          <p><strong>Owner:</strong> {data.owner}</p>
          <p><strong>Phone:</strong> {data.phoneNumber}</p>
          <h4>Issue Description:</h4>
          <ul>
            {(data.issueDescription || []).map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>

        </div>

        <div className="right-column">
          <h3>Engineer Info</h3>
          <h4>Issue Discovered:</h4>
          <ul>
            {(data.issueDiscovered || []).map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>
          <h4>Issue Solved:</h4>
          <ul>
            {(data.issueSolved || []).map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>
         <hr />
          <label>view image uploaded <a
            href={`http://localhost:5000/${data.image}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-image-link"
          >
            Photo
          </a></label>

          {/* addpayment information */}
          <h3>Payment Info</h3>
          <p><strong>Amount Paid:</strong> {data.amountPaid}</p>
          <p><strong>Method of Payment:</strong> {data.paymentMethod}</p>
   
          {/* adding information of payment */}
          {showPaymentForm && (
     <AddPaymentOverlay
    data={data}
    onClose={() => setShowPaymentForm(false)}
    onPaymentAdded={() => window.location.reload()} // or refetch data if using context/query
  />
)}

          <hr />
          <p><strong>Status:</strong> <span className={`status ${data.status.replace(/\s+/g, '-').toLowerCase()}`}>{data.status}</span></p>
       
        </div>
      </div>
    </div>
  );
};

export default ReceptionDetailView;
