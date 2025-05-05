"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Save, Search, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

const Subject = () => {
  const [subjects, setSubjects] = useState<{ id: string; name: string; code?: string; }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<{ id: string; name: string; code?:string; } | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code:""
  });
  
  // Fetch branches on component mount - adding empty dependency array to run only once
  useEffect(() => {
    fetchSubjects();
  }, []); // This empty array is crucial - it tells React to run this effect only once
  
  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/subject`);
      if (response.ok) {
        const data = await response.json();
        setSubjects(data);
      } else {
        setError("Failed to fetch Subjects");
      }
    } catch (err) {
      setError("Error fetching Subjects: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      code: ""
    });
  };

  const openSidebar = (subject: { id: string; name: string; code:string } | null = null) => {
    if (subject) {
      setCurrentSubject(subject);
      setFormData({
        name: subject.name,
        code: subject.code || ""
      });
    } else {
      setCurrentSubject(null);
      resetForm();
    }
    setSidebarOpen(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    setCurrentSubject(null);
    resetForm();
  };

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e?.preventDefault();
    setError("");

    if (!formData.name) {
      setError("Subject Name is required");
      return;
    }

    if (!formData.code) {
      setError("Subject code is required");
      return;
    }

    try {
      // Set loading state only for the form submission
      const isEditing = !!currentSubject;
      const submitButtonLoading = true;
      
      let response;

      if (isEditing) {
        // Update existing branch
        response = await fetch(`/api/subject?id=${currentSubject.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        // Create new branch
        response = await fetch("/api/subject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchSubjects();
        closeSidebar();
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to save subject");
      }
    } catch (err) {
      setError("Error saving subject: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      // Not needed as fetchBranches will handle the loading state
      // and closeSidebar will reset the form
    }
  };

  const handleDelete = async (id: string | undefined) => {
    if (!confirm("Are you sure you want to delete this subject?")) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/subject?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchSubjects();
        if (currentSubject?.id === id) {
          closeSidebar();
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete subject");
      }
    } catch (err) {
      setError("Error deleting Subject: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCoures = subjects.filter(subject => 
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.code ?? "").toLowerCase().includes(searchTerm.toLowerCase()) 
  );

  return (
    <div className="relative space-y-4">
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
        <h2 className="text-xl font-semibold">Subject Management</h2>
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search Subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => openSidebar()} className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Subject
          </Button>
        </div>
      </div>

      {/* Subjects Table */}
      <div className="bg-white rounded-md shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">#</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[120px]">Name</th>
                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[80px]">Code</th>
                <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider min-w-[100px]">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && subjects.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <div className="flex justify-center mb-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                    <p className="text-gray-500">Loading subjects...</p>
                  </td>
                </tr>
              ) : filteredCoures.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm ? "No subjects match your search" : "No subjects found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredCoures.map((subject, index) => (
                  <tr key={subject.id} className="hover:bg-gray-50">
                    <td className="px-3 py-1 whitespace-nowrap text-sm text-gray-500">{index + 1}</td>
                    <td className="px-3 py-1 whitespace-nowrap text-sm font-medium">{subject.name}</td>
                    <td className="px-3 py-1 whitespace-nowrap">
                      <Badge variant="outline" className="bg-blue-50 text-xs">
                        {subject.code || "—"}
                      </Badge>
                    </td>
                    <td className="px-3 py-1 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={() => openSidebar({ ...subject, code: subject.code || "" })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" 
                          onClick={() => handleDelete(subject.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right Sidebar for Create/Edit */}
      <div className={`fixed inset-y-0 right-0 w-full md:w-1/3 lg:max-w-md bg-white shadow-lg border-l border-gray-200 transform transition-transform duration-300 ease-in-out z-50 ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-medium">
              {currentSubject ? "Edit Subject" : "Add New Subject"}
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 rounded-full" 
              onClick={closeSidebar}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="p-4 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Name <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter subject name"
                />
              </div>
              
              <div>
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject Code <span className="text-red-500">*</span>
                </label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="Enter subject code"
                />
              </div>
            </div>
          </div>
          <div className="p-4 border-t bg-gray-50">
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeSidebar}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>{currentSubject ? "Updating..." : "Creating..."}</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>{currentSubject ? "Update" : "Create"}</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
};

export default Subject;