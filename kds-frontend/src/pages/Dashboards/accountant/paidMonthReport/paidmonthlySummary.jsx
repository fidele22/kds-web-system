import React, { useState, useEffect } from 'react';
import './monthlypaidReport.css'; // Create a CSS file for styling
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PaidMonthlyReport = () => {
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState('');
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [searchDate, setSearchDate] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchPaymentMethod, setSearchPaymentMethod] = useState('');
  const [paymentSummary, setPaymentSummary] = useState({});

  const fetchPaidReport = async () => {
    if (!month) return;
    try {
      const response = await fetch(`http://localhost:5000/api/monthlyRecord-Report/paid-monthly-report?month=${month}`);
      const data = await response.json();
      setRecords(data);
      setFilteredRecords(data);
      calculateTotalAndSummary(data);
    } catch (error) {
      console.error('Error fetching paid report:', error);
    }
  };

  const calculateTotalAndSummary = (data) => {
    const total = data.reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0);
    setTotalAmount(total);

    const summary = data.reduce((acc, item) => {
      const method = item.paymentMethod || 'Unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});
    setPaymentSummary(summary);
  };

  useEffect(() => {
    fetchPaidReport();
  }, [month]);

  useEffect(() => {
    handleFilters();
  }, [searchDate, searchPhone, searchPaymentMethod, records]);

  const handleFilters = () => {
    let filtered = records;

    if (searchDate) {
      filtered = filtered.filter(item =>
        new Date(item.createdAt).toISOString().split('T')[0] === searchDate
      );
    }
    if (searchPhone) {
      filtered = filtered.filter(item =>
        item.phoneNumber && item.phoneNumber.toLowerCase().includes(searchPhone.toLowerCase())
      );
    }
    if (searchPaymentMethod) {
      filtered = filtered.filter(item =>
        item.paymentMethod && item.paymentMethod === searchPaymentMethod
      );
    }

    setFilteredRecords(filtered);
    calculateTotalAndSummary(filtered);
  };

  const getFormattedMonthYear = () => {
    if (!month) return '';
    const [year, monthNumber] = month.split('-');
    const date = new Date(year, monthNumber - 1);
    const options = { month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(12);
    doc.text(`Paid Clients Report of ${getFormattedMonthYear()}`, 14, 10);

    doc.autoTable({
      head: [['Date', 'Owner', 'Phone', 'Received Tool', 'Tool No', 'Plaque', 'Amount Paid', 'Payment Method']],
      body: filteredRecords.map(item => [
        new Date(item.createdAt).toLocaleDateString(),
        item.owner,
        item.phoneNumber,
        item.receivedTool,
        item.receivedToolNumber,
        item.plate,
        item.amountPaid,
        item.paymentMethod
      ]),
      startY: 20,
      styles: { cellPadding: 2, fontSize: 9, lineColor: [0, 0, 0], lineWidth: 0.5 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.text(`Total Amount Paid: ${totalAmount} RWF`, 14, doc.lastAutoTable.finalY + 10);
    doc.text(`Total Clients: ${filteredRecords.length}`, 14, doc.lastAutoTable.finalY + 20);

    doc.save('paid_monthly_report.pdf');
  };

  const downloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredRecords.map(item => ({
      Date: new Date(item.createdAt).toLocaleDateString(),
      Owner: item.owner,
      Phone: item.phoneNumber,
      ReceivedTool: item.receivedTool,
      ToolNumber: item.receivedToolNumber,
      Plaque: item.plate,
      AmountPaid: item.amountPaid,
      PaymentMethod: item.paymentMethod,
    })));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Paid Report');
    XLSX.writeFile(workbook, 'paid_monthly_report.xlsx');
  };

  return (
    <div className="paid-monthly-report">
      <h2>Paid Clients Monthly Report</h2>

      <div className="report-generation">
        <label>Select Month:</label>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />

        <div className="paid-summary-filters">
          <input
            type="date"
            value={searchDate}
            onChange={(e) => setSearchDate(e.target.value)}
            placeholder="Search by Date"
          /> <p>or:</p>
          <input
            type="text"
            placeholder="Search by Phone Number"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
          /><p>or:</p>
          <select
            value={searchPaymentMethod}
            onChange={(e) => setSearchPaymentMethod(e.target.value)}
          >
            <option value="">Select Payment Method</option>
            <option value="Cash">Cash</option>
            <option value="Mobile Money">Mobile Money</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {month && (
          <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>
            Paid Clients Report of {getFormattedMonthYear()}
          </h3>
        )}

        <button onClick={downloadPDF}>Download PDF</button>
        <button onClick={downloadExcel}>Download Excel</button>

        <div className="summary-info">
          <div className="total">
          <p><strong>Total Clients:</strong> {filteredRecords.length}</p>
          <p><strong>Total Amount Paid:</strong> {totalAmount} RWF</p>
          </div>
          <div>
            <h4>Payment Summary:</h4>
            <ul>
              {Object.keys(paymentSummary).map((method) => (
                <li key={method}><strong>{method}:</strong> {paymentSummary[method]} clients</li>
              ))}
            </ul>
          </div>
        </div>

        <table className="report-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Owner</th>
              <th>Phone</th>
              <th>Received Tool</th>
              <th>Tool No</th>
              <th>Plaque</th>
              <th>Amount Paid</th>
              <th>Payment Method</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                <td>{item.owner}</td>
                <td>{item.phoneNumber}</td>
                <td>{item.receivedTool}</td>
                <td>{item.receivedToolNumber}</td>
                <td>{item.plate}</td>
                <td>{item.amountPaid} RWF</td>
                <td>{item.paymentMethod}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

  );
};

export default PaidMonthlyReport;