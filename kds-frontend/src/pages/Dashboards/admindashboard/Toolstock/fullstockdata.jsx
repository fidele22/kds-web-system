import React, { useEffect, useState } from 'react';
import './fullstockstyling.css'
const StockDetailView = ({ item, onBack }) => {
  const [stockHistory, setStockHistory] = useState([]);

  // Fetch stock history when the component mounts
  useEffect(() => {
    if (item && item._id) {
      fetch(`http://localhost:5000/api/stockTool/stockhistory/${item._id}`) // Endpoint to fetch history by item ID
        .then((response) => response.json())
        .then((data) => {
          setStockHistory(data); // Set the history data to state
        })
        .catch((error) => {
          console.error('Error fetching stock history:', error);
        });
    }
  }, [item]);

  return (
    <div className="stock-detail-overlay">
        <button onClick={onBack}>Back</button>
      <div className="stock-detail-modal">
        <div className="stock-data">
        <h4>Entry Info</h4>
        <p><strong>ToolName:</strong> {item.name}</p>
        <p><strong>Stored on:</strong> {new Date(item.createdAt).toLocaleDateString()}</p>
        <p><strong>Status:</strong> {item.status}</p>

    
          <a href={`http://localhost:5000/${item.image}`} target="_blank" rel="noopener noreferrer">
            View Image
          </a>
        
        </div>
        <div className="stock-history">
        <h4>Tool Stock History</h4>
        {stockHistory.length > 0 ? (
          <table className="stock-history-table">
            <thead>
              <tr>
                <th>Part Removed</th>
                <th>Removed Date</th>
              </tr>
            </thead>
            <tbody>
              {stockHistory.map((history) => (
                <tr key={history._id}>
                  <td>{history.partremoved}</td>
                  <td>{new Date(history.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No part removed for this tool.</p>
        )}
        </div>
    

     <div className="tool-image"> 
        <h4>Photo of tool</h4>
     <a href={`http://localhost:5000/${item.image}`} target="_blank" rel="noopener noreferrer">
          <img src={`http://localhost:5000/${item.image}`} alt={item.name} />
        </a>
     </div>
      </div>
    </div>
  );
};

export default StockDetailView;
