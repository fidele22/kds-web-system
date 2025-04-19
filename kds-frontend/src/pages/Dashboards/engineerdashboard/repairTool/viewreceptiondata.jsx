// src/components/ReceptionList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './issueDiscovered.css';

const statusOptions = {
  'Pending': ['In Progress'],
  'In Progress': ['Completed', 'Uncompleted'],
  'Completed': ['Returned to Owner'],
  'Uncompleted': ['Returned to Owner'],
};

const ReceptionList = () => {
  const [data, setData] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEntry, setEditingEntry] = useState(null);
  const itemsPerPage = 5;

  useEffect(() => {
    getUserRoleFromSession();
    fetchReceptionData();
  }, []);

  const getUserRoleFromSession = () => {
    const role = sessionStorage.getItem('role');
    if (role) {
      setUserRole(role);
    }
  };

  const fetchReceptionData = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/reception-form/view-receptionForm');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching reception data:', error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/reception-form/${id}`, { status: newStatus });
      alert('Status updated successfully!');
      fetchReceptionData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getAvailableStatusOptions = (currentStatus) => {
    if (userRole === 'RECEPTIONIST') {
      if (currentStatus === 'Completed' || currentStatus === 'Uncompleted') {
        return ['Returned to Owner'];
      } else {
        return [];
      }
    } else {
      return statusOptions[currentStatus] || [];
    }
  };

  const handleEditClick = (entry) => {
    setEditingEntry(entry);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditingEntry((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/reception-form/add-checkup-data/${editingEntry._id}`, editingEntry);
      alert('Reception data updated successfully!');
      setEditingEntry(null);
      fetchReceptionData();
    } catch (error) {
      console.error('Error updating reception form:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'issueDiscovered') {
      const lines = value.split('\n').map((line) => line.replace(/^\d+\.\s*/, ''));
      setEditingEntry((prev) => ({ ...prev, issueDiscovered: lines }));
    }
    else if (name === 'issueSolved') {
      const lines = value.split('\n').map((line) => line.replace(/^\d+\.\s*/, ''));
      setEditingEntry((prev) => ({ ...prev, issueSolved: lines }));
    }
    else {
      setEditingEntry((prev) => ({ ...prev, [name]: value }));
    }
  };
  

  const getFormattedIssueText = () => {
    return (editingEntry.issueDiscovered || [])
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');
  };
  
  const getFormattedIssueSolvedText = () => {
    return (editingEntry.issueSolved || [])
      .map((item, index) => `${index + 1}. ${item}`)
      .join('\n');
  };
  const handleEditCancel = () => {
    setEditingEntry(null);
  };

  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    const isDateMatch = selectedDate
      ? entryDate.toDateString() === selectedDate.toDateString()
      : true;
    const isStatusMatch = statusFilter ? entry.status === statusFilter : true;
    const isOwnerMatch = ownerSearch
      ? entry.owner?.toLowerCase().includes(ownerSearch.toLowerCase())
      : true;
    return isDateMatch && isStatusMatch && isOwnerMatch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="reception-list-container">
      <h2>Reception Records</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <div>
          <label>Date:</label><br />
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              setCurrentPage(1);
            }}
            placeholderText="Select date"
            className="custom-datepicker"
          />
        </div>

        <div>
          <label>Search by Owner:</label><br />
          <input
            type="text"
            placeholder="Enter owner name"
            value={ownerSearch}
            onChange={(e) => {
              setOwnerSearch(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div>
          <label>Status:</label><br />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All</option>
            {[...new Set(data.map((item) => item.status))].map((status, idx) => (
              <option key={idx} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="reception-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Received Tool</th>
            <th>Plate</th>
            <th>Owner</th>
            <th>Phone</th>
            <th>Issue Description</th>
            <th>Image</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.length > 0 ? paginatedData.map((entry, index) => {
            const options = getAvailableStatusOptions(entry.status);
            return (
              <tr key={entry._id}>
                <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                <td>{entry.receivedTool}</td>
                <td>{entry.plate}</td>
                <td>{entry.owner}</td>
                <td>{entry.phoneNumber}</td>
                <td>
                  <ol>
                    {(entry.issueDescription || []).map((desc, i) => (
                      <li key={i}>{desc}</li>
                    ))}
                  </ol>
                </td>
                <td>
                  <button
                    onClick={() => window.open(`http://localhost:5000/${entry.image}`, '_blank')}
                    style={{
                      backgroundColor: '#007bff',
                      color: '#fff',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    View Photo
                  </button>
                </td>
                <td>{entry.status}</td>
                <td>
                  {options.length > 0 ? (
                    <select
                      defaultValue=""
                      onChange={(e) => handleStatusChange(entry._id, e.target.value)}
                    >
                      <option value="" disabled>Choose status</option>
                      {options.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: 'gray', fontSize: '12px' }}>No actions</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => handleEditClick(entry)}
                    style={{
                      backgroundColor: 'orange',
                      color: '#fff',
                      border: 'none',
                      padding: '5px 10px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="11" style={{ textAlign: 'center' }}>No records found</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      {/* Overlay Edit Form */}
      {editingEntry && (
        <div className="overlay">
          <div className="overlay-content">
            <h3>Edit Reception Entry</h3>
            <form onSubmit={handleEditSubmit}>
              <label>Received Tool:</label>
              <input name="receivedTool" value={editingEntry.receivedTool} onChange={handleEditChange} />

              <label>Plate:</label>
              <input name="plate" value={editingEntry.plate} onChange={handleEditChange} />

              <label>Owner:</label>
              <input name="owner" value={editingEntry.owner} onChange={handleEditChange} />

              <label>Phone Number:</label>
              <input name="phoneNumber" value={editingEntry.phoneNumber} onChange={handleEditChange} />

           
     <label>Issue Discovered (auto-numbered):</label>
        <textarea
          name="issueDiscovered"
          value={getFormattedIssueText()}
          onChange={handleInputChange}
          rows="6"
          placeholder="Describe issues discovered, one per line"
          required
        ></textarea>
                 
     <label>Issue Solved (auto-numbered):</label>
        <textarea
          name="issueSolved"
          value={getFormattedIssueSolvedText()}
          onChange={handleInputChange}
          rows="6"
          placeholder="Describe issues discovered, one per line"
          required
        ></textarea>
              <div style={{ marginTop: '10px' }}>
                <button type="submit">Save</button>
                <button type="button" onClick={handleEditCancel} style={{ marginLeft: '10px' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionList;
