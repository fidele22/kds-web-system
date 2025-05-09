import React, { useEffect, useState } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './receptionform.css';

const statusOptions = {
  'Pending': ['In Progress'],
  'In Progress': ['Completed', 'Uncompleted'],
  'Completed': ['Paid', 'UnPaid', 'In Progress'],
  'Paid': ['Returned to Owner'],
  'UnPaid': ['Paid'],
  'Uncompleted': ['Returned to Owner'],
};
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending':
      return 'status-badge status-pending';
    case 'In Progress':
      return 'status-badge status-in-progress';
    case 'Completed':
      return 'status-badge status-completed';
    case 'Uncompleted':
      return 'status-badge status-uncompleted';
    case 'Paid':
      return 'status-badge status-paid';
    case 'UnPaid':
          return 'status-badge status-unpaid';  
    case 'Returned to Owner':
      return 'status-badge status-returned';
    default:
      return 'status-badge';
  }
};

const ReceptionList = () => {
  const [data, setData] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

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
      await axios.put(`http://localhost:5000/api/reception-form/updated-status/${id}`, { status: newStatus });
      alert('Status updated successfully!');
      fetchReceptionData();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getAvailableStatusOptions = (currentStatus) => {
    if (userRole === 'RECEPTIONIST') {
      if (currentStatus === 'Paid' || currentStatus === 'Uncompleted') {
        return ['Returned to Owner'];
      } else {
        return [];
      }
    } else {
      return statusOptions[currentStatus] || [];
    }
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
      <h3>Reception Records</h3>
    <div className="reception-records-data">

    
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
      <div className="table-scroll-container">
      <table className="reception-table">
     
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Received Tool</th>
            <th>received Tool N°</th>
            <th>Plaque</th>
            <th>Owner</th>
            <th>Phone</th>
            <th>Issue Description</th>
            <th>Image</th>
            <th>Status</th>
            <th>Update Status</th>
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
                <td>{entry.receivedToolNumber}</td>
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
                      fontSize:'12px'
                    }}
                  >
                    Photo
                  </button>
                </td>
                <td>
            <span className={getStatusBadgeClass(entry.status)}>
             {entry.status}
            </span>
                </td>

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
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="10" style={{ textAlign: 'center' }}>No records found</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
      <div className='pagination-btn' style={{ marginTop: '15px', display: 'flex', justifyContent: 'center', gap: '10px' }}>
        <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </button>
        <span>Page {currentPage} of {totalPages}</span>
        <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
     
      </div>
    </div>
  );
};

export default ReceptionList;
