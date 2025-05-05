import React, { useState } from "react";
import { Loader2, Download, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import * as Papa from "papaparse";

// Types
interface FileImporterProps {
  onImport: (data: any[]) => Promise<void>;
  acceptedFileTypes?: string;
  buttonText?: string;
  className?: string;
}

interface FileExporterProps {
  data: any[];
  fileName?: string;
  headers?: Record<string, string>;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

/**
 * Component for importing data from Excel or CSV files
 */
export const FileImporter: React.FC<FileImporterProps> = ({
  onImport,
  acceptedFileTypes = ".xlsx,.xls,.csv",
  buttonText = "Import",
  className = "flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:bg-green-400",
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      let parsedData: any[] = [];

      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        // Handle Excel files
        parsedData = await readExcelFile(file);
      } else if (file.name.endsWith(".csv")) {
        // Handle CSV files
        parsedData = await readCSVFile(file);
      } else {
        throw new Error("Unsupported file format");
      }

      // Call the provided onImport function with the parsed data
      await onImport(parsedData);
    } catch (err) {
      console.error("Error processing file:", err);
      throw err;
    } finally {
      setIsUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  // Read Excel file
  const readExcelFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (!e.target) {
            reject(new Error("FileReader target is null"));
            return;
          }
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Read CSV file
  const readCSVFile = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          resolve(results.data as any[]);
        },
        error: (error) => {
          reject(error);
        },
      });
    });
  };

  return (
    <div className="relative">
      <input
        type="file"
        onChange={handleFileUpload}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        accept={acceptedFileTypes}
      />
      <button className={className} disabled={isUploading}>
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
        ) : (
          <Upload className="h-4 w-4 mr-2" />
        )}
        {buttonText}
      </button>
    </div>
  );
};

/**
 * Component for exporting data to Excel
 */
export const FileExporter: React.FC<FileExporterProps> = ({
  data,
  fileName = `export_${new Date().toISOString().split("T")[0]}`,
  headers = {},
  buttonText = "Export",
  className = "flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition",
  disabled = false,
}) => {
  const exportToExcel = () => {
    if (data.length === 0 || disabled) {
      return;
    }

    // Format data for export, applying header mappings if provided
    const exportData = data.map((item) => {
      const formattedItem: Record<string, any> = {};
      
      if (Object.keys(headers).length > 0) {
        // Use header mappings
        Object.entries(headers).forEach(([key, displayName]) => {
          formattedItem[displayName] = item[key] || "";
        });
      } else {
        // Use data as is
        Object.assign(formattedItem, item);
      }
      
      return formattedItem;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    
    // Ensure filename has .xlsx extension
    const finalFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
    XLSX.writeFile(workbook, finalFileName);
  };

  return (
    <button
      onClick={exportToExcel}
      className={className}
      disabled={disabled || data.length === 0}
    >
      <Download className="h-4 w-4 mr-2" />
      {buttonText}
    </button>
  );
};