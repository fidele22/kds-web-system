import { useState } from 'react';
import axios from 'axios';
import './searchinfo.css';

const AdminEngineerTracker = () => {
  const [toolQuery, setToolQuery] = useState({
    receivedTool: '',
    receivedToolNumber: '',
    plate: '',
    owner: ''
  });

  const [engineerQuery, setEngineerQuery] = useState({
    name: '',
    phone: ''
  });

  const [toolResults, setToolResults] = useState([]);
  const [engineerResults, setEngineerResults] = useState([]);

  const [toolPage, setToolPage] = useState(0);
  const [engineerPage, setEngineerPage] = useState(0);

  const pageSize = 5;

  const handleToolSearch = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/monthlyRecord-Report/search-by-tool`, { params: toolQuery });
    setToolResults(res.data);
    setToolPage(0);
  };

  const handleEngineerSearch = async () => {
    const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/monthlyRecord-Report/search-by-engineer`, { params: engineerQuery });
    setEngineerResults(res.data);
    setEngineerPage(0);
  };

  const clearToolResults = () => {
    setToolResults([]);
    setToolPage(0);
  };

  const clearEngineerResults = () => {
    setEngineerResults([]);
    setEngineerPage(0);
  };

  const paginate = (data, page) => {
    return data.slice(page * pageSize, (page + 1) * pageSize);
  };

  return (
    <div className="tracker-container">
      {/* Tool Search */}
      <div>
      <div className="tool-search-box">
        <h2>Search Engineer by Tool Info</h2>
        <div className="search-box">
          <input placeholder="Received Tool" value={toolQuery.receivedTool}
            onChange={(e) => setToolQuery({ ...toolQuery, receivedTool: e.target.value })} /> or
          <input placeholder="Received Tool Number" value={toolQuery.receivedToolNumber}
            onChange={(e) => setToolQuery({ ...toolQuery, receivedToolNumber: e.target.value })} /> or
          <input placeholder="Plate" value={toolQuery.plate}
            onChange={(e) => setToolQuery({ ...toolQuery, plate: e.target.value })} /> or
          <input placeholder="Owner" value={toolQuery.owner}
            onChange={(e) => setToolQuery({ ...toolQuery, owner: e.target.value })} />
          <button className="search-btn blue" onClick={handleToolSearch}>Search</button>
        </div>
      </div>

      {/* Engineer Search */}
      <div className="engineer-search-box">
        <h2>Search Tools by Engineer</h2>
        <div className="search-box">
          <input  placeholder="Name" value={engineerQuery.name}
            onChange={(e) => setEngineerQuery({ ...engineerQuery, name: e.target.value })} /> or
          <input placeholder="Phone" value={engineerQuery.phone}
            onChange={(e) => setEngineerQuery({ ...engineerQuery, phone: e.target.value })} />
          <button className="search-btn green" onClick={handleEngineerSearch}>Search</button>
        </div>

        {/* Engineer Results */}
        {engineerResults.length > 0 && (
          <div className="results">
            <div className="track-results-header">
            <h3>Tools repaired by engineer: {engineerQuery.name || `Phone ${engineerQuery.phone}`}</h3>
            <button onClick={clearEngineerResults} className="track-close-button">×</button>
            </div>
           
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tool</th>
                  <th>Tool №</th>
                  <th>Plaque</th>
                  <th>Owner</th>
                  <th>Issue solved</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {paginate(engineerResults, engineerPage).map((r, index) => (
                  <tr key={r._id}>
                    <td>{engineerPage * pageSize + index + 1}</td>
                    <td>{r.receivedTool}</td>
                    <td>{r.receivedToolNumber}</td>
                    <td>{r.plate}</td>
                    <td>{r.owner}</td>
                    <td>{r.issueSolved}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-buttons">
  <button onClick={() => setEngineerPage(p => Math.max(p - 1, 0))} disabled={engineerPage === 0}>Previous</button>
  <span className="page-info">Page {engineerPage + 1} of {Math.ceil(engineerResults.length / pageSize)}</span>
  <button onClick={() => setEngineerPage(p => (p + 1) * pageSize < engineerResults.length ? p + 1 : p)} disabled={(engineerPage + 1) * pageSize >= engineerResults.length}>Next</button>
</div>

          </div>
        )}

        {/* Tool Results */}
        {toolResults.length > 0 && (
          <div className="results">
            <div className="track-results-header">
            <h3>Engineer(s) who worked on the tool: {toolQuery.receivedTool || `Tool No. ${toolQuery.receivedToolNumber}` || `Plate ${toolQuery.plate}` || `Owner ${toolQuery.owner}`}</h3>
            <button onClick={clearToolResults} className="track-close-button">×</button>
            </div>
            <table className="results-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tool</th>
                  <th>Tool №</th>
                  <th>Plaque</th>
                  <th>Owner</th>
                  <th>Solved By</th>
                  <th>Discovered By</th>
                </tr>
              </thead>
              <tbody>
                {paginate(toolResults, toolPage).map((r, index) => (
                  <tr key={r._id}>
                    <td>{toolPage * pageSize + index + 1}</td>
                    <td>{r.receivedTool}</td>
                    <td>{r.receivedToolNumber}</td>
                    <td>{r.plate}</td>
                    <td>{r.owner}</td>
                    <td>{r.issueSolvedBy?.firstName} {r.issueSolvedBy?.lastName} - {r.issueSolvedBy?.phone}</td>
                    <td>{r.issueDiscoveredBy?.firstName} {r.issueDiscoveredBy?.lastName} - {r.issueDiscoveredBy?.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-buttons">
  <button onClick={() => setToolPage(p => Math.max(p - 1, 0))} disabled={toolPage === 0}>Previous</button>
  <span className="page-info">Page {toolPage + 1} of {Math.ceil(toolResults.length / pageSize)}</span>
  <button onClick={() => setToolPage(p => (p + 1) * pageSize < toolResults.length ? p + 1 : p)} disabled={(toolPage + 1) * pageSize >= toolResults.length}>Next</button>
</div>

          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default AdminEngineerTracker;
