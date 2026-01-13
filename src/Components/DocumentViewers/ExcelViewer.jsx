import { useState, useEffect } from 'react';
import { Spin, Table, Tabs, message } from 'antd';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';

import './DocumentViewers.css';

const ExcelViewer = ({ fileUrl, fileName }) => {
  const [sheets, setSheets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const parseExcel = async () => {
      if (!fileUrl) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch the file as ArrayBuffer
        const response = await fetch(fileUrl);
        if (!response.ok) {
          throw new Error('Failed to fetch document');
        }

        const arrayBuffer = await response.arrayBuffer();

        // Parse Excel file using xlsx
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        // Convert each sheet to table data
        const sheetData = workbook.SheetNames.map((sheetName) => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          if (jsonData.length === 0) {
            return {
              name: sheetName,
              columns: [],
              data: [],
            };
          }

          // First row as headers
          const headers = jsonData[0] || [];
          const columns = headers.map((header, index) => ({
            title: header || `Column ${index + 1}`,
            dataIndex: `col_${index}`,
            key: `col_${index}`,
            ellipsis: true,
          }));

          // Rest of the rows as data
          const data = jsonData.slice(1).map((row, rowIndex) => {
            const rowData = { key: rowIndex };
            headers.forEach((_, colIndex) => {
              rowData[`col_${colIndex}`] = row[colIndex] !== undefined ? row[colIndex] : '';
            });
            return rowData;
          });

          return {
            name: sheetName,
            columns,
            data,
          };
        });

        setSheets(sheetData);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        setError('Failed to load Excel file. The file may be corrupted or in an unsupported format.');
        message.error('Failed to load Excel file');
      } finally {
        setIsLoading(false);
      }
    };

    parseExcel();
  }, [fileUrl]);

  if (isLoading) {
    return (
      <div className="document-viewer-loading">
        <Spin size="large" tip="Loading Excel file..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="document-viewer-error">
        <p>{error}</p>
      </div>
    );
  }

  if (sheets.length === 0) {
    return (
      <div className="document-viewer-error">
        <p>No data found in the Excel file.</p>
      </div>
    );
  }

  const tabItems = sheets.map((sheet, index) => ({
    key: String(index),
    label: sheet.name,
    children: (
      <div className="excel-sheet-content">
        {sheet.columns.length > 0 ? (
          <Table
            columns={sheet.columns}
            dataSource={sheet.data}
            pagination={{ pageSize: 50, showSizeChanger: true }}
            scroll={{ x: 'max-content', y: 400 }}
            size="small"
            bordered
          />
        ) : (
          <p className="text-gray-500">This sheet is empty.</p>
        )}
      </div>
    ),
  }));

  return (
    <div className="excel-viewer">
      <div className="excel-viewer-header">
        <span className="file-name">{fileName || 'Excel Spreadsheet'}</span>
      </div>
      <div className="excel-viewer-content">
        {sheets.length === 1 ? (
          <div className="excel-sheet-content">
            {sheets[0].columns.length > 0 ? (
              <Table
                columns={sheets[0].columns}
                dataSource={sheets[0].data}
                pagination={{ pageSize: 50, showSizeChanger: true }}
                scroll={{ x: 'max-content', y: 400 }}
                size="small"
                bordered
              />
            ) : (
              <p className="text-gray-500">This sheet is empty.</p>
            )}
          </div>
        ) : (
          <Tabs items={tabItems} />
        )}
      </div>
    </div>
  );
};

ExcelViewer.propTypes = {
  fileUrl: PropTypes.string.isRequired,
  fileName: PropTypes.string,
};

export default ExcelViewer;
