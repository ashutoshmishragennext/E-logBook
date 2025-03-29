// app/log-book-templates/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import TemplateTable from './TemplateTable';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';

interface FilterParams {
  academicYearId?: string;
  batchId?: string;
  subjectId?: string;
  moduleId?: string;
}

export default function LogBookTemplatePage() {
  const searchParams = useSearchParams();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get filter params from URL
  const academicYearId = searchParams.get('academicYearId') || '';
  const batchId = searchParams.get('batchId') || '';
  const subjectId = searchParams.get('subjectId') || '';
  const moduleId = searchParams.get('moduleId') || '';
  
  // States for filter dropdowns (you would populate these from your API)
  const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
  const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string; code: string }[]>([]);
  const [modules, setModules] = useState<{ id: string; name: string }[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<FilterParams>({
    academicYearId,
    batchId,
    subjectId,
    moduleId: moduleId || undefined
  });

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        
        // Build query string from filter parameters
        const queryParams = new URLSearchParams();
        if (selectedFilters.academicYearId) queryParams.append('academicYearId', selectedFilters.academicYearId);
        if (selectedFilters.batchId) queryParams.append('batchId', selectedFilters.batchId);
        if (selectedFilters.subjectId) queryParams.append('subjectId', selectedFilters.subjectId);
        if (selectedFilters.moduleId) queryParams.append('moduleId', selectedFilters.moduleId);
        
        const queryString = queryParams.toString();
        const apiUrl = `/api/log-book-template${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Error fetching templates: ${response.statusText}`);
        }
        
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch templates');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch filter options (in a real app, you would get these from your API)
    const fetchFilterOptions = async () => {
      // These would be actual API calls in a real application
      setAcademicYears([{ id: '2f8ab354-1f21-4d0f-ad41-87a39e44b0be', name: '2023-2024' }]);
      setBatches([{ id: '86f6cdd7-281c-4eba-b423-e835360b012e', name: 'Phase I' }]);
      setSubjects([{ id: 'e92e5996-bfcc-4097-8605-63dd00f4156c', name: 'Computer Science', code: 'CS101' }]);
      setModules([{ id: '13f35a6b-2c2a-4386-b99e-d5685127afe2', name: 'Data Structures' }]);
    };

    fetchFilterOptions();
    fetchTemplates();
  }, [selectedFilters]);
  const handleFilterChange = (key: keyof FilterParams, value: string) => {
    if (value === "all") {
      // Clear this specific filter
      const updatedFilters = { ...selectedFilters };
      delete updatedFilters[key];
      setSelectedFilters(updatedFilters);
      
      // Update URL (remove parameter)
      const url = new URL(window.location.href);
      url.searchParams.delete(key);
      window.history.pushState({}, '', url);
    } else {
      // Set the filter value as before
      setSelectedFilters(prev => ({ ...prev, [key]: value }));
      
      // Update URL
      const url = new URL(window.location.href);
      url.searchParams.set(key, value);
      window.history.pushState({}, '', url);
    }
  };
  const clearFilters = () => {
    setSelectedFilters({});
    // Clear URL params
    window.history.pushState({}, '', window.location.pathname);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 text-red-600 p-4 rounded-md border border-red-200">
          <h3 className="font-bold">Error Loading Data</h3>
          <p>{error}</p>
          <Button 
            variant="outline" 
            className="mt-2" 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Log Book Templates</h1>
        <p className="text-gray-500 mt-2">View and manage log book template structures</p>
      </div>
      
      {/* Filters Section */}
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Select 
                value={selectedFilters.academicYearId || ''} 
                onValueChange={(value) => handleFilterChange('academicYearId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Academic Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Academic Years</SelectItem>
                  {academicYears.map((year: any) => (
                    <SelectItem key={year.id} value={year.id}>{year.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Batch/Phase</label>
              <Select 
                value={selectedFilters.batchId || ''} 
                onValueChange={(value) => handleFilterChange('batchId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Batch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Batches</SelectItem>
                  {batches.map((batch: any) => (
                    <SelectItem key={batch.id} value={batch.id}>{batch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Select 
                value={selectedFilters.subjectId || ''} 
                onValueChange={(value) => handleFilterChange('subjectId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject: any) => (
                    <SelectItem key={subject.id} value={subject.id}>{subject.name} ({subject.code})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Module</label>
              <Select 
                value={selectedFilters.moduleId || ''} 
                onValueChange={(value) => handleFilterChange('moduleId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Module" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  {modules.map((module: any) => (
                    <SelectItem key={module.id} value={module.id}>{module.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="text-sm"
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Results Section */}
      {templates.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-600">No templates found</h3>
          <p className="text-gray-500 mt-2">Try adjusting your filters or create a new template</p>
        </div>
      ) : (
        <TemplateTable templates={templates} />
      )}
    </div>
  );
}