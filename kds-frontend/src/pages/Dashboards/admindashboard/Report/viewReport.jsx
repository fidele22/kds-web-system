import React, { useEffect, useState } from 'react';

import './monthlyreport.css'; // optional CSS file

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; // ← import autotable like this


import * as XLSX from 'xlsx';


const MonthlyReport = () => {

  const [records, setRecords] = useState([]);

  const [month, setMonth] = useState('');

  const [totalAmount, setTotalAmount] = useState(0);


  const fetchReport = async () => {

    if (!month) return;

    try {

      const response = await fetch(`http://localhost:5000/api/monthlyRecord-Report/monthly-report?month=${month}`);
      const data = await response.json();
      setRecords(data);
      const total = data.reduce((sum, item) => sum + (parseFloat(item.amountPaid) || 0), 0);
      setTotalAmount(total);

    } catch (error) {
      console.error('Error fetching monthly report:', error);

    }

  };


  useEffect(() => {

    fetchReport();

  }, [month]);


  const getFormattedMonthYear = () => {

    if (!month) return '';

    const [year, monthNumber] = month.split('-');
    const date = new Date(year, monthNumber - 1);

    const options = { month: 'long', year: 'numeric' };

    return date.toLocaleDateString('en-US', options);

  };


  const downloadPDF = () => {

    const doc = new jsPDF();

    doc.setFontSize(11);

    doc.text(`Work and Payment Report of ${getFormattedMonthYear()}`, 14, 10);

    autoTable(doc, {
      margin: { top: 20, left: 5, right: 5},
      head: [['Date', 'Received Tool', 'Received Tool No', 'Plaque', 'Owner', 'Phone', 'Issue Solved', 'Amount Paid', 'Payment Method']],
      body: records.map(item => [
        new Date(item.createdAt).toLocaleDateString(),
        item.receivedTool,
        item.receivedToolNumber,
        item.plate,
        item.owner,
        item.phoneNumber,
        item.issueSolved,
        item.amountPaid,
        item.paymentMethod
      ]),
      startY: 15,
      styles: {
        lineWidth: 0.2, // thickness of lines
        lineColor: [0, 1, 1], // black color
        cellPadding: 2, // optional, for better spacing inside cells
      },
    });
    

    doc.text(`Total: ${totalAmount} RWF`, 14, doc.lastAutoTable.finalY + 10);

    doc.save('monthly_report.pdf');

  };


  const downloadExcel = () => {

    const worksheet = XLSX.utils.json_to_sheet(records.map(item => ({

      Date: new Date(item.createdAt).toLocaleDateString(),

      ReceivedTool: item.receivedTool,

      ReceivedToolNO: item.receivedToolNumber,

      Plaque: item.plate,

      Owner: item.owner,

      Phone: item.phoneNumber,

      IssueSolved: item.issueSolved,

      AmountPaid: item.amountPaid,

      PaymentMethod: item.paymentMethod,

    })));


    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Monthly Report');

    XLSX.writeFile(workbook, 'monthly_report.xlsx');

  };


  return (

    <div className="monthly-report">

      <h2>Monthly Payment Report</h2>

      <div className="report-generation">

        <label>Select Month:</label>

        <input

          type="month"

          value={month}

          onChange={(e) => setMonth(e.target.value)}

        />

        {month && (

          <h3 style={{ marginTop: '20px', marginBottom: '10px' }}>

            Work and Payment Report of {getFormattedMonthYear()}

          </h3>

        )}

        <button onClick={downloadPDF}>Download PDF</button>

        <button onClick={downloadExcel}>Download Excel</button>

        <table className='report-table'>

          <thead>

            <tr>

              <th>Date</th>

              <th>Received Tool</th>

              <th>Received Tool No</th>

              <th>Plaque</th>

              <th>Owner</th>

              <th>Phone</th>

              <th>Issue Solved</th>

              <th>Amount Paid</th>

              <th>Payment Method</th>

            </tr>

          </thead>

          <tbody>

            {records.map((item) => (

              <tr key={item._id}>

                <td>{new Date(item.createdAt).toLocaleDateString()}</td>

                <td>{item.receivedTool}</td>

                <td>{item.receivedToolNumber}</td>

                <td>{item.plate}</td>

                <td>{item.owner}</td>

                <td>{item.phoneNumber}</td>

                <td>{item.issueSolved}</td>

                <td>{item.amountPaid} RWF</td>

                <td>{item.paymentMethod}</td>

              </tr>

            ))}

          </tbody>

          {records.length > 0 && (

            <tfoot>

              <tr>

                <td colSpan="7"><strong>Total</strong></td>

                <td colSpan="2"><strong>{totalAmount} RWF</strong></td>

              </tr>

            </tfoot>

          )}

        </table>

      </div>

    </div>

  );

};


export default MonthlyReport;