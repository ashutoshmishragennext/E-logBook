"use client";

import { Check } from "lucide-react";
import { useState, useEffect } from "react";

interface SubjectSelectorProps {
  onSubjectSelect: (subjectId: string) => void;
  onSubjectRequest: (subjectName: string) => void;
  selectedSubjectIds: string[];
  disabled?: boolean;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
}

export default function SubjectSelector({
  onSubjectSelect,
  onSubjectRequest,
  selectedSubjectIds,
  disabled = false,
  searchQuery = "",
  onSearchChange,
}: SubjectSelectorProps) {
  const [query, setQuery] = useState(searchQuery);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code?: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Sync with parent component's search query
  useEffect(() => {
    if (onSearchChange) {
      onSearchChange(query);
    }
  }, [query, onSearchChange]);

  useEffect(() => {
    if (!query) {
      setSubjects([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchSubjects();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchSubjects = async () => {
    if (disabled) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/search/subject?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
      setMessage("Failed to fetch subjects");
    } finally {
      setLoading(false);
    }
  };

  // Check if there's an exact match (case-insensitive)
  const hasExactMatch = subjects.some(
    (subject) => subject.name.toLowerCase() === query.toLowerCase()
  );

  // Show add option if query is not empty and there's no exact match
  const showAddOption = query.trim() !== "" && !hasExactMatch && !disabled;

  const handleRequest = async () => {
    try {
      await onSubjectRequest(query);
      setQuery("");
      setSubjects([]);
    } catch (err) {
      console.error(err);
      setMessage("Failed to send request.");
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <input
          type="text"
          placeholder={disabled ? "Select criteria above to search subjects" : "Search subject..."}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setMessage("");
          }}
          disabled={disabled}
          className={`w-full p-2 border rounded ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
        />
        {loading && (
          <div className="absolute right-3 top-2.5">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}
      </div>

      {message && <p className="mt-1 text-sm text-red-600">{message}</p>}

      <div className={`border rounded mt-1 overflow-hidden ${disabled ? 'bg-gray-50' : 'bg-white'}`}>
        {!loading && subjects.length > 0 && (
          <ul className="divide-y">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                onClick={() => onSubjectSelect(subject.id)}
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
        )}

        {!loading && showAddOption && (
          <div className="border-t">
            <button
              type="button"
              onClick={handleRequest}
              className="w-full p-2 text-left text-sm text-blue-600 hover:bg-blue-50"
            >
              + Request to add "{query}"
            </button>
          </div>
        )}
      </div>
    </div>
  );
}