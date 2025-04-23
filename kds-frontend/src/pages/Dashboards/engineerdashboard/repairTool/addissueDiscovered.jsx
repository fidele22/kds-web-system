import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBars  } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './issueDiscovered.css';

const statusOptions = {
  'Pending': ['In Progress'],
  'In Progress': ['Completed', 'Uncompleted'],
  'Completed': ['Returned to Owner'],
  'Uncompleted': ['Returned to Owner'],
};

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Pending': return 'status-badge status-pending';
    case 'In Progress': return 'status-badge status-in-progress';
    case 'Completed': return 'status-badge status-completed';
    case 'Uncompleted': return 'status-badge status-uncompleted';
    case 'Returned to Owner': return 'status-badge status-returned';
    default: return 'status-badge';
  }
};

const ReceptionList = () => {
  const [data, setData] = useState([]);
  const [ownerSearch, setOwnerSearch] = useState('');
  const [userRole, setUserRole] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [editingEntry, setEditingEntry] = useState(null);
  const [dropdownOpenId, setDropdownOpenId] = useState(null);

  const itemsPerPage = 5;

  useEffect(() => {
    getUserRoleFromSession();
    fetchReceptionData();

    const handleClickOutside = (event) => {
      if (!event.target.closest('.action-menu-wrapper')) {
        setDropdownOpenId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const getUserRoleFromSession = () => {
    const role = sessionStorage.getItem('role');
    if (role) setUserRole(role);
  };

  const fetchReceptionData = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axios.get(`http://localhost:5000/api/reception-form/view-completed-task/${userId}`);
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
    if (userRole === 'ENGINEER') {
      if (currentStatus === 'In Progress') return ['Completed', 'Uncompleted'];
      return [];
    } else if (userRole === 'RECEPTIONIST') {
      if (currentStatus === 'Completed' || currentStatus === 'Uncompleted') return ['Returned to Owner'];
      return [];
    } else {
      return statusOptions[currentStatus] || [];
    }
  };
  const handleEditSubmit = async (e) => {

    e.preventDefault();

    const userId = sessionStorage.getItem('userId');


    try {

      await axios.put(

        `http://localhost:5000/api/reception-form/add-checkup-data/${editingEntry._id}`,

        {

          ...editingEntry,

          issueDiscoveredBy: userId,

          issueSolvedBy: userId

        }

      );

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

    } else if (name === 'issueSolved') {

      const lines = value.split('\n').map((line) => line.replace(/^\d+\.\s*/, ''));

      setEditingEntry((prev) => ({ ...prev, issueSolved: lines }));

    } else {

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


  const handleEditCancel = () => {

    setEditingEntry(null);

  };


  const filteredData = data.filter((entry) => {
    const entryDate = new Date(entry.createdAt);
    const isDateMatch = selectedDate ? entryDate.toDateString() === selectedDate.toDateString() : true;
    const isStatusMatch = statusFilter ? entry.status === statusFilter : true;
    const isOwnerMatch = ownerSearch ? entry.owner?.toLowerCase().includes(ownerSearch.toLowerCase()) : true;
    return isDateMatch && isStatusMatch && isOwnerMatch;
  });

  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const toggleDropdownMenu = (id) => {
    setDropdownOpenId(prev => prev === id ? null : id);
  };

  return (
    <div className="engineer-reception-list">
      <h2>Records with Issue Discovered and Solved</h2>
      <div className="reception-records">

      
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
              <option key={idx} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-scroll-container">
        <table className="engineer-reception-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Received Tool</th>
              <th>Plate</th>
              <th>Owner</th>
              <th>Issue Description</th>
              <th>Image</th>
              <th>Issue Discovered</th>
              <th>Issue Solved</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((entry, index) => {
              const options = getAvailableStatusOptions(entry.status);
              return (
                <tr key={entry._id}>
                  <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                  <td>{new Date(entry.createdAt).toLocaleDateString()}</td>
                  <td>{entry.receivedTool}</td>
                  <td>{entry.plate}</td>
                  <td>{entry.owner}</td>
                  <td>
                    <ol>{(entry.issueDescription || []).map((desc, i) => <li key={i}>{desc}</li>)}</ol>
                  </td>
                  <td>
                    <button
                      onClick={() => window.open(`http://localhost:5000/${entry.image}`, '_blank')}
                      className="view-photo-button"
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
                  <td>
                    <ol>{(entry.issueDiscovered || []).map((desc, i) => <li key={i}>{desc}</li>)}</ol>
                  </td>
                  <td>
                    <ol>{(entry.issueSolved || []).map((desc, i) => <li key={i}>{desc}</li>)}</ol>
                  </td>
                  <td>
                    <span className={getStatusBadgeClass(entry.status)}>{entry.status}</span>
                  </td>
                  <td style={{ position: 'relative' }}>
                    <div className="action-menu-wrapper">
                      <button onClick={() => toggleDropdownMenu(entry._id)}><FaBars /></button>
                      {dropdownOpenId === entry._id && (
                         <div className="dropdown-menu">

                         <button onClick={() => handleEditClick(entry)}>Edit</button>

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

                       
                         
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
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
           {/* Overlay Edit Form */}

           {editingEntry && (

<div className="editingEntry-overlay">

  <div className="engineer-editingEntry-form">

    <h3>Add issue discovered and solved</h3>

    <form className='editreception-form' onSubmit={handleEditSubmit}>

      {/* Info Display Grid */}

      <div className="entry-details-grid">

        <div className="entry-detail">

          <label>Received Tool:</label>

          <p>{editingEntry.receivedTool}</p>

        </div>

        <div className="entry-detail">

          <label>Received Tool Number:</label>

          <p>{editingEntry.receivedToolNumber || "N/A"} </p>

        </div>

        <div className="entry-detail">

          <label>Plaque:</label>

          <p>{editingEntry.plate || "N/A"}</p>

        </div>

        <div className="entry-detail">

          <label>Owner:</label>

          <p>{editingEntry.owner}</p>

        </div>

      </div>


      {/* Editable Fields */}

      <label >Issue Discovered (auto-numbered):</label>

      <textarea

        name="issueDiscovered"

        value={getFormattedIssueText()}

        onChange={handleInputChange}

        rows="6"

        placeholder="Describe issues discovered, one per line"

        readOnly

      ></textarea>


      <label>Issue Solved (auto-numbered):</label>

      <textarea

        name="issueSolved"

        value={getFormattedIssueSolvedText()}

        onChange={handleInputChange}

        rows="6"

        placeholder="Describe issues solved, one per line"

      ></textarea>


      <div className='editentry-btn' style={{ marginTop: '10px' }}>

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
