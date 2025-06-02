/*eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";

interface PDFExporterProps {
  data: any[];
  buttonText?: string;
  className?: string;
  teacherName?: string;
  templateName?: string;
  allFields?: any[];
}

const PDFExporter: React.FC<PDFExporterProps> = ({
  data,
  buttonText = "Export PDF",
  className = "",
  teacherName = "",
  templateName = "",
  allFields = []
}) => {
  const generatePDF = () => {
    // Create a new window for the PDF content
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      alert('Please allow popups to export PDF');
      return;
    }

    // Generate HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>E-log Book</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
          }
          .header h1 {
            margin: 0 0 10px 0;
            font-size: 24px;
            font-weight: bold;
          }
          .header-info {
            margin: 10px 0;
            font-size: 14px;
          }
          .teacher-name {
            font-weight: bold;
            color: #2563eb;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            font-size: 12px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
            vertical-align: top;
          }
          th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
          }
          .date-column {
            width: 100px;
          }
          .remarks-column {
            width: 150px;
          }
          .field-column {
            width: 120px;
          }
          .no-data {
            text-align: center;
            font-style: italic;
            color: #666;
            padding: 20px;
          }
          .entry-row:nth-child(even) {
            background-color: #f9f9f9;
          }
          .break-word {
            word-wrap: break-word;
            word-break: break-word;
            max-width: 150px;
          }
          @media print {
            body {
              margin: 0;
            }
            .header {
              page-break-after: avoid;
            }
            table {
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>E-log Book</h1>
          ${teacherName ? `<div class="header-info">Teacher: <span class="teacher-name">${teacherName}</span></div>` : ''}
          ${templateName ? `<div class="header-info">Template: ${templateName}</div>` : ''}
          <div class="header-info">Generated on: ${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>

        ${data.length > 0 ? `
          <table>
            <thead>
              <tr>
                <th class="date-column">Date of Entry</th>
                ${allFields.map(field => `<th class="field-column">${field.fieldLabel}</th>`).join('')}
                <th class="remarks-column">Student Remarks</th>
                <th class="remarks-column">Teacher Remarks</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(entry => `
                <tr class="entry-row">
                  <td class="date-column">
                    ${entry.createdAt ? new Date(entry.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : '-'}
                  </td>
                  ${allFields.map(field => `
                    <td class="field-column break-word">
                      ${entry.dynamicFields?.[field.fieldName] ? 
                        (field.fieldType === 'file' ? 'File Attached' : entry.dynamicFields[field.fieldName]) 
                        : '-'}
                    </td>
                  `).join('')}
                  <td class="remarks-column break-word">
                    ${entry.studentRemarks || '-'}
                  </td>
                  <td class="remarks-column break-word">
                    ${entry.teacherRemarks || '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        ` : `
          <div class="no-data">
            <p>No entries found to export.</p>
          </div>
        `}
      </body>
      </html>
    `;

    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load, then trigger print dialog
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  return (
    <Button
      onClick={generatePDF}
      className={className}
      disabled={!data || data.length === 0}
    >
      <FileDown className="mr-2 h-4 w-4" />
      {buttonText}
    </Button>
  );
};

export default PDFExporter;