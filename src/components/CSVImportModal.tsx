import React, { useState } from 'react';
import { X, Upload, Download, AlertCircle } from 'lucide-react';
import { useApplicationStore } from '../store/useApplicationStore';
import { parseCSV, csvToApplications } from '../utils/csvUtils';

interface CSVImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CSVImportModal: React.FC<CSVImportModalProps> = ({ isOpen, onClose }) => {
  const { importFromCSV } = useApplicationStore();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file.');
      return;
    }

    setFile(selectedFile);
    setError('');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        const rows = parseCSV(csvText);
        setPreview(rows.slice(0, 5)); // Show first 5 rows
      } catch (err) {
        setError('Error parsing CSV file. Please check the format.');
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const csvText = e.target?.result as string;
          const rows = parseCSV(csvText);
          const applications = csvToApplications(rows);
          importFromCSV(applications);
          
          onClose();
          setFile(null);
          setPreview([]);
          setError('');
        } catch (err) {
          setError('Error importing applications. Please check the CSV format.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error reading file.');
      setIsProcessing(false);
    }
  };

  const downloadTemplate = () => {
    const template = `type,name,organization,country,region,link,applicationOpen,deadline,stage,timelineStatus,notes
scholarship,Example Scholarship,University,USA,North America,https://example.com,2024-01-01,2024-03-15,To Apply,EST,Sample scholarship notes
admission,Computer Science MS,MIT,USA,North America,https://mit.edu,2024-02-01,2024-04-01,In Progress,CON,Sample admission notes`;
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'scholarflow-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Import Applications from CSV</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h3>
            <p className="text-blue-800 text-sm mb-3">
              Your CSV file should have the following columns: type, name, organization, country, region, link, applicationOpen, deadline, stage, timelineStatus, notes
            </p>
            <button
              onClick={downloadTemplate}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              <Download className="h-4 w-4" />
              <span>Download Template</span>
            </button>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-2">
              <p className="text-gray-600">
                Drop your CSV file here, or{' '}
                <label className="text-primary-600 hover:text-primary-700 cursor-pointer font-medium">
                  browse
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </p>
              <p className="text-sm text-gray-500">CSV files only</p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* File Info */}
          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Selected File</h4>
              <p className="text-sm text-gray-600">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </p>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Preview (First 5 rows)</h4>
              <div className="overflow-x-auto border rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {Object.keys(preview[0]).map(key => (
                        <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, index) => (
                      <tr key={index}>
                        {Object.values(row).map((value: any, valueIndex) => (
                          <td key={valueIndex} className="px-3 py-2 text-sm text-gray-900 max-w-32 truncate">
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-4 p-6 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="btn-secondary"
            disabled={isProcessing}
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={!file || isProcessing}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Importing...' : 'Import Applications'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CSVImportModal; 