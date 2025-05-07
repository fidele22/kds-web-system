import React, { useEffect, useState, useRef } from 'react';
import './stockstyling.css';
import { FaBars } from 'react-icons/fa';
import StockDetailView from './fullstockdata';

const ViewStockItems = () => {
  const [items, setItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showStockDetailView, setShowStockDetailView] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [partRemoved, setPartRemoved] = useState('');
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  
  // New state for filtering
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const dropdownRef = useRef(null);
  const itemsPerPage = 10;
  const baseImageURL = 'http://localhost:5000/';

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/stockTool/view-savedTool');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  // Filter items based on name and status
  const filteredItems = items.filter(item => {
    const matchesName = item.name.toLowerCase().includes(nameFilter.toLowerCase());
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    return matchesName && matchesStatus;
  });

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleAddPart = async (e) => {
    e.preventDefault();
    if (selectedItemId && partRemoved) {
      try {
        await fetch('http://localhost:5000/api/stockTool/save-part-removed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId: selectedItemId, partremoved: partRemoved }),
        });
        alert('Part removed successfully.');
        setPartRemoved('');
        setShowForm(false);
        fetchItems();
      } catch (error) {
        console.error('Error adding part:', error);
      }
    }
  };

  const handleRemoveItem = async (itemId) => {
    const confirm = window.confirm('Are you sure you want to mark this item as removed?');
    if (!confirm) return;

    try {
      const res = await fetch(`http://localhost:5000/api/stockTool/update-stock-status/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'removed' }),
      });

      if (res.ok) {
        alert('Item marked as removed.');
        fetchItems(); // refresh the list
      } else {
        alert('Failed to update item.');
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleSeeMoreStockData = (item) => {
    setSelectedItem(item);
    setShowStockDetailView(true);
  };

  const handleBack = () => {
    setSelectedItem(null);
    setShowStockDetailView(false);
  };

  const toggleDropdown = (itemId) => {
    setOpenDropdownId(prevId => (prevId === itemId ? null : itemId));
  };

  return (
    <div className="stock-container">
      <h2 className="section-title">Stock of tools</h2>

      {/* Filter Inputs */}
      <div className="stock-filter-section">
        <input
          type="text"
          placeholder="Filter by Name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          >
          <option value="">All Statuses</option>
          <option value="in-stock">In Stock</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      {filteredItems.length === 0 ? (
        <p>No items found.</p>
      ) : (
        <div className="stock-data-container">
          <table className="stock-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Date</th>
                <th>Name</th>
                <th>Image</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, index) => (
                <tr key={item._id}>
                  <td>{indexOfFirstItem + index + 1}</td>
                  <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td>{item.name}</td>
                  <td>
                    <a
                      href={`${baseImageURL}${item.image}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-link"
                    >
                      View Image
                    </a>
                  </td>
                  <td className={item.status === 'in-stock' ? 'status-green' : 'status-red'}>
                    {item.status}
                  </td>
                  <td>
                    <div className="dropdown" ref={dropdownRef}>
                      <button
                        className="dropbtn"
                        onClick={() => toggleDropdown(item._id)}
                      >
                        <FaBars />
                      </button>
                      {openDropdownId === item._id && (
                        <div className="dropdown-content show">
                          <button
                            onClick={() => {
                              setSelectedItemId(item._id);
                              setShowForm(true);
                              setOpenDropdownId(null); // close dropdown
                            }}
                            disabled={item.status === 'removed'}
                          >
                            Remove Part
                          </button>
                          <hr />
                          <button
                            onClick={() => {
                              handleSeeMoreStockData(item);
                              setOpenDropdownId(null);
                            }}
                          >
                            See More
                          </button>
                          <hr />
                          <button
                            onClick={() => {
                              handleRemoveItem(item._id);
                              setOpenDropdownId(null);
                            }}
                          >
                            Remove Item
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="stock-table-pagination">
            <button onClick={handlePrev} disabled={currentPage === 1}>
              &laquo; Previous
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Next &raquo;
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <div className="overlay">
          <div className="modal">
            <h3>Enter part removed</h3>
            <form onSubmit={handleAddPart}>
              <input
                type="text"
                value={partRemoved}
                onChange={(e) => setPartRemoved(e.target.value)}
                placeholder="Part Removed"
                required
              />
              <button className="save-partremoved-btn" type="submit">Save</button>
              <button
                className="cancel-partremoved-form"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {showStockDetailView && selectedItem && (
        <StockDetailView item={selectedItem} onBack={handleBack} />
      )}
    </div>
  );
};

export default ViewStockItems;
