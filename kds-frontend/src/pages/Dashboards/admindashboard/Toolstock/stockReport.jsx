import React, { useState } from 'react';
import './fullstockstyling.css';
const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthlyReport = () => {
  const today = new Date();
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [reportData, setReportData] = useState([]);

  const generateReport = async () => {
    const month = String(selectedMonthIndex + 1).padStart(2, '0');
    const year = selectedYear;

    try {
      const response = await fetch(`http://localhost:5000/api/monthlyRecord-Report/stock-monthly-report?month=${month}&year=${year}`);
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
    }
  };

  const groupedData = reportData.reduce((acc, entry) => {
    const key = entry.itemId?._id || 'unknown';
    if (!acc[key]) {
      acc[key] = { item: entry.itemId, entries: [] };
    }
    acc[key].entries.push(entry);
    return acc;
  }, {});

  return (
    <div className="monthly-report-container">
         <h3>Generate Monthly Report</h3>
        <div className="monthly-stock-report">

     

      <div className="filter-controls">
        <button onClick={() => setSelectedYear(prev => prev - 1)}>&laquo;</button>
        <span>{selectedYear}</span>
        <button onClick={() => setSelectedYear(prev => prev + 1)}>&raquo;</button>

        <select
          value={selectedMonthIndex}
          onChange={(e) => setSelectedMonthIndex(parseInt(e.target.value))}
        >
          {months.map((month, index) => (
            <option key={month} value={index}>{month}</option>
          ))}
        </select>

        <button onClick={generateReport}>Generate</button>
      </div>

      {reportData.length > 0 ? (
        <table className="stock-report-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Item Name</th>
              <th>Stored Date</th>
              <th>Status</th>
              <th>Part Removed</th>
              <th>Removed Date</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(groupedData).map(([itemId, group], groupIndex) =>
              group.entries.map((entry, entryIndex) => (
                <tr key={entry._id || `${itemId}-${entryIndex}`}>
                  {entryIndex === 0 && (
                    <>
                      <td rowSpan={group.entries.length}>{groupIndex + 1}</td>
                      <td rowSpan={group.entries.length}>{group.item.name}</td>
                      <td rowSpan={group.entries.length}>{new Date(group.item.createdAt).toLocaleDateString()}</td>
                      <td rowSpan={group.entries.length}>{group.item.status}</td>
                    </>
                  )}
                  <td>{entry.partremoved}</td>
                  <td>{entry.removedDate ? new Date(entry.removedDate).toLocaleDateString() : '—'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <p>No report data found for {months[selectedMonthIndex]} {selectedYear}.</p>
      )}
    </div>
    </div>
  );
};

export default MonthlyReport;
