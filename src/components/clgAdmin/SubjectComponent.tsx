/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { Check, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface SubjectSelectorProps {
  selectedPhaseId: string;
  onSelectSubject: (subjectId: string) => void; // Modified to accept just the ID
  disabled?: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedSubject?: { id: string; name: string; code?: string } | null;
}

export default function SubjectSelector({
  selectedPhaseId,
  onSelectSubject,
  disabled = false,
  searchQuery,
  setSearchQuery,
  selectedSubject,
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);

  // Fetch subjects when search query changes
  useEffect(() => {
    if (!searchQuery || !selectedPhaseId) {
      setSubjects([]);
      setIsDropdownOpen(false);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSubjects();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, selectedPhaseId]);

  // Initialize selectedSubjectIds when component mounts or selectedSubject changes
  useEffect(() => {
    if (selectedSubject) {
      setSelectedSubjectIds([selectedSubject.id]);
    }
  }, [selectedSubject]);

  const fetchSubjects = async () => {
    if (disabled || !selectedPhaseId) return;
    
    setLoading(true);
    try {
      // Updated to include phaseId as a parameter for better filtering
      const res = await fetch(`/api/search/subject?q=${encodeURIComponent(searchQuery)}&phaseId=${encodeURIComponent(selectedPhaseId)}`);
      const data = await res.json();
      console.log("Fetched subjects:", data);
      setSubjects(data);
      setIsDropdownOpen(data.length > 0 || searchQuery.trim() !== "");
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  // Check if there's an exact match (case-insensitive)
  const hasExactMatch = subjects.some(
    (subject) => subject.name.toLowerCase() === searchQuery.toLowerCase()
  );

  // Show add option if query is not empty and there's no exact match
  const showAddOption = searchQuery.trim() !== "" && !hasExactMatch && !disabled;

  const handleRequest = async () => {
    try {
      // You would implement this functionality if needed
      alert(`Request to add "${searchQuery}" has been sent.`);
      setSearchQuery("");
      setSubjects([]);
      setIsDropdownOpen(false);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send request.");
    }
  };

  const handleSelect = (subject: { id: string; name: string; code?: string }) => {
    // Pass only the subject ID to the parent component
    onSelectSubject(subject.id);
    
    // Display the selected subject name in the input field
    setSearchQuery(subject.name);
    
    setIsDropdownOpen(false);
    
    // Track selected subject for visual feedback
    setSelectedSubjectIds([subject.id]);
  };

  // Force dropdown to close when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="w-full relative">
      <div className="relative">
        <input
          type="text"
          placeholder={disabled ? "Select phase first to search subjects" : "Search subject..."}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setMessage("");
          }}
          onFocus={() => setIsDropdownOpen(true)}
          onClick={() => setIsDropdownOpen(true)}
          disabled={disabled}
          className={`w-full p-2 border rounded ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>

      {message && <p className="mt-1 text-sm text-red-600">{message}</p>}

      {(isDropdownOpen && (subjects.length > 0 || showAddOption)) && (
        <div 
          className="absolute z-20 w-full mt-1 border rounded shadow-lg bg-white"
          onClick={(e) => e.stopPropagation()} // Prevent clicks inside dropdown from closing it
        >
          {subjects.length > 0 ? (
            <ul className="divide-y max-h-60 overflow-auto">
              {subjects.map((subject) => (
                <li
                  key={subject.id}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent blur event from firing before click
                    handleSelect(subject);
                  }}
                  className={`p-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between ${
                    selectedSubjectIds.includes(subject.id) ? 'bg-blue-50' : ''
                  }`}
                >
                  <span>
                    {subject.name} {subject.code && `(${subject.code})`}
                  </span>
                  {selectedSubjectIds.includes(subject.id) && (
                    <Check className="h-4 w-4 text-green-500" />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-2 text-gray-500 text-sm">No subjects found</div>
          )}

          {showAddOption && (
            <div className="border-t">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault(); // Prevent blur event from firing before click
                  handleRequest();
                }}
                className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50"
              >
                 add {searchQuery}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}