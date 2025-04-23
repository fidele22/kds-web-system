import React from 'react';
import './ReceptionDetailView.css';

const ReceptionDetailView = ({ data, onBack }) => {
  if (!data) return <div>No data to show</div>;

  return (
    <div className="reception-detail-view">
      <button onClick={onBack} className="back-btn">Go Back</button>
      <div className="grid-container">
        <div className="left-column">
          <h3>Reception Info</h3>
          <p><strong>Date:</strong> {new Date(data.createdAt).toLocaleDateString()}</p>
          <p><strong>Received Tool:</strong> {data.receivedTool}</p>
          <p><strong>Tool Number:</strong> {data.receivedToolNumber}</p>
          <p><strong>Plaque:</strong> {data.plate}</p>
          <p><strong>Status:</strong> <span className={`status ${data.status.replace(/\s+/g, '-').toLowerCase()}`}>{data.status}</span></p>
        </div>

        <div className="right-column">
          <h3>Owner Info</h3>
          <p><strong>Owner:</strong> {data.owner}</p>
          <p><strong>Phone:</strong> {data.phoneNumber}</p>
          <h3>Issue Description</h3>
          <ul>
            {(data.issueDescription || []).map((desc, i) => (
              <li key={i}>{desc}</li>
            ))}
          </ul>
          <h3>Image</h3>
          <a
            href={`http://localhost:5000/${data.image}`}
            target="_blank"
            rel="noopener noreferrer"
            className="view-image-link"
          >
            View Photo
          </a>
        </div>
      </div>
    </div>
  );
};

export default ReceptionDetailView;
