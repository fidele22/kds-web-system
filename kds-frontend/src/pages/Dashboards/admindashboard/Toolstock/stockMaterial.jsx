import React, { useEffect, useState } from 'react';
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
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);

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

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleSeeMoreStockData = (item) => {
    console.log('Item clicked:', item); // This is logged correctly
    setSelectedItem(item);
    setShowStockDetailView(true);
  };
  
  console.log('Selected Item:', selectedItem); // This will check if selectedItem has updated before passing to the detail view
  
  const handleBack = () => {
    setSelectedItem(null);
    setShowStockDetailView(false);
  };

  return (
    <div className="stock-container">
      <h2 className="section-title">Stock Items</h2>

      {items.length === 0 ? (
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
                  <td className="text-capitalize">{item.status}</td>
                  <td>
                    <div className="dropdown">
                      <button
                        className="dropbtn"
                        onClick={() => setDropdownVisible(!dropdownVisible)}
                      >
                        <FaBars />
                      </button>
                      <div className={`dropdown-content ${dropdownVisible ? 'show' : ''}`}>
                        <button
                          onClick={() => {
                            setSelectedItemId(item._id);
                            setShowForm(true);
                          }}
                        >
                          Add Part
                        </button>
                        <button onClick={() => handleSeeMoreStockData(item)}>See More</button>
                      </div>
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
              <button className='save-partremoved-btn' type="submit">Save</button>
              <button className='cancel-partremoved-form' type="button" onClick={() => setShowForm(false)}>
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
