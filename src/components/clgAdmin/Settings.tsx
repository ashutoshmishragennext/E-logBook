"use client";

import { useState, useEffect } from "react";

export default function SubjectSelector() {
  const [query, setQuery] = useState("");
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

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
    setLoading(true);
    try {
      const res = await fetch(`/api/search/subject?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setSubjects(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Check if there's an exact match (case-insensitive)
  const hasExactMatch = subjects.some(
    (subject) => subject.name.toLowerCase() === query.toLowerCase()
  );

  // Show add option if query is not empty and there's no exact match
  const showAddOption = query.trim() !== "" && !hasExactMatch;

  const handleRequest = async () => {
    try {
      const res = await fetch("/api/search/subject", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: query }),
      });

      const result = await res.json();
      setMessage(result.message || "Request sent");
    } catch (err) {
      console.error(err);
      setMessage("Failed to send request.");
    }
  };

  return (
    <div className="w-full max-w-md p-4 border rounded">
      <input
        type="text"
        placeholder="Search subject..."
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setMessage("");
        }}
        className="w-full p-2 border rounded mb-2"
      />

      {loading && <p>Loading...</p>}

      <div className="border rounded mt-2">
        {!loading && subjects.length > 0 && (
          <ul className="p-2 space-y-1">
            {subjects.map((subject) => (
              <li
                key={subject.id}
                className="p-1 hover:bg-gray-100 cursor-pointer"
              >
                {subject.name}
              </li>
            ))}
          </ul>
        )}

        {!loading && showAddOption && (
          <div className=" border-t">
            <button
              onClick={handleRequest}
              className="mt-1 py-1 text-black rounded text-sm w-full"
            >
              Request Admin to Add "{query}"
            </button>
          </div>
        )}
      </div>

      {message && <p className="mt-2 text-green-600">{message}</p>}
    </div>
  );
}