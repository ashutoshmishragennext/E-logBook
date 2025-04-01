/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/auth";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LogBookEntry {
  id: string;
  logBookTemplateId: string;
  studentId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  dynamicFields: Record<string, any>;
  template?: {
    id: string;
    name: string;
    academicYearId: string;
    academicYear?: { id: string; name: string };
    batchId: string;
    batch?: { id: string; name: string };
    subjectId: string;
    subject?: { id: string; name: string };
    moduleId: string;
    module?: { id: string; name: string };
  };
}

export const StudentLogBookEntries = () => {
  const user = useCurrentUser();
  const [entries, setEntries] = useState<LogBookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudentEntries = async () => {
      if (!user) return;

      try {
        setLoading(true);
        
        // First get student profile
        const studentRes = await fetch(`/api/student-profile?byUserId=${user.id}`);
        if (!studentRes.ok) throw new Error('Failed to fetch student profile');
        const studentData = await studentRes.json();
        
        if (!studentData?.id) throw new Error('No student profile found');
        console.log('Student Data:', studentData.id);

        // Then get log book entries with template details
        const entriesRes = await fetch(`/api/log-books?studentId=${studentData.id}&includeTemplate=true`);
        if (!entriesRes.ok) throw new Error('Failed to fetch log book entries');
        const entriesData = await entriesRes.json();

        setEntries(entriesData);
        setError(null);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load entries');
        setEntries([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentEntries();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-3xl mt-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (entries.length === 0) {
    return (
      <Card className="mx-auto max-w-4xl shadow-md">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">My Log Book Entries</CardTitle>
          <CardDescription>A record of your academic activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/30 p-8 rounded-md text-center">
            <p className="text-muted-foreground">No log book entries found.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get all fields with their sequences
  const getOrderedFieldNames = (entry: LogBookEntry) => {
    const fieldGroups: {name: string, sequence: number}[] = [];
    const staticFields: string[] = [];
    
    // Add template info first
    if (entry.template) {
      staticFields.push('Template');
      if (entry.template.academicYear) staticFields.push('Academic Year');
      if (entry.template.batch) staticFields.push('Batch');
      if (entry.template.subject) staticFields.push('Subject');
      if (entry.template.module) staticFields.push('Module');
    }
    
    staticFields.push('Created At');
    
    // Get all dynamic fields with their sequence numbers
    if (entry.dynamicFields) {
      Object.keys(entry.dynamicFields).forEach(group => {
        // Skip the personalInfo field as it's not for display
        if (group === 'personalInfo') return;
        
        if (typeof entry.dynamicFields[group] === 'object') {
          // Look for sequence property (_sequence or *sequence)
          let sequence = null;
          if (entry.dynamicFields[group]._sequence !== undefined) {
            sequence = entry.dynamicFields[group]._sequence;
          } else if (entry.dynamicFields[group]['_sequence'] !== undefined) {
            sequence = entry.dynamicFields[group]['_sequence'];
          } else if (entry.dynamicFields[group]['*sequence'] !== undefined) {
            sequence = entry.dynamicFields[group]['*sequence'];
          }
          
          if (sequence !== null) {
            fieldGroups.push({ name: group, sequence });
          } else {
            // If no sequence found, add to the end
            fieldGroups.push({ name: group, sequence: 999 });
          }
        }
      });
    }
    
    // Sort field groups by sequence
    fieldGroups.sort((a, b) => a.sequence - b.sequence);
    
    // Final list of field names
    const fields = [...staticFields];
    
    // Add dynamic fields based on sorted sequence
    fieldGroups.forEach(group => {
      if (typeof entry.dynamicFields[group.name] === 'object') {
        Object.keys(entry.dynamicFields[group.name]).forEach(field => {
          // Skip the sequence fields
          if (field === '_sequence' || field === '*sequence') return;
          
          fields.push(`${group.name}.${field}`);
        });
      } else {
        fields.push(group.name);
      }
    });
    
    fields.push('Status');
    
    return fields;
  };

  const fieldNames = entries.length > 0 ? getOrderedFieldNames(entries[0]) : [];

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toUpperCase()) {
      case 'SUBMITTED':
        return 'default';
      case 'APPROVED':
        return 'default';
      case 'REJECTED':
        return 'destructive';
      case 'DRAFT':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Format a field name for display
  const formatFieldName = (fieldName: string) => {
    const name = fieldName.split('.').pop() || '';
    return name
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper function to format dates properly
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <Card className="shadow-md">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold text-primary">My Log Book Entries</CardTitle>
          <CardDescription>A comprehensive record of your academic activities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-lg border">
            <Table className="min-w-full">
              <TableHeader className="bg-primary/5">
                <TableRow>
                  {fieldNames.map((fieldName) => (
                    <TableHead key={fieldName} className="whitespace-nowrap font-medium text-primary">
                      {formatFieldName(fieldName)}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, entryIndex) => {
                  const rowData: Record<string, any> = {};
                  
                  // Template info
                  if (entry.template) {
                    rowData['Template'] = entry.template.name;
                    if (entry.template.academicYear) {
                      rowData['Academic Year'] = entry.template.academicYear.name;
                    }
                    if (entry.template.batch) {
                      rowData['Batch'] = entry.template.batch.name;
                    }
                    if (entry.template.subject) {
                      rowData['Subject'] = entry.template.subject.name;
                    }
                    if (entry.template.module) {
                      rowData['Module'] = entry.template.module.name;
                    }
                  }
                  
                  // Format date nicely
                  rowData['Created At'] = formatDate(entry.createdAt);
                  
                  // Dynamic fields
                  if (entry.dynamicFields) {
                    Object.keys(entry.dynamicFields).forEach(group => {
                      if (typeof entry.dynamicFields[group] === 'object') {
                        Object.keys(entry.dynamicFields[group]).forEach(field => {
                          if (field !== '_sequence' && field !== '*sequence') {
                            let value = entry.dynamicFields[group][field];
                            
                            // Check if this is a date_of_birth field and format it without time
                            if (field === 'date_of_birth' && typeof value === 'string' && value.includes('T')) {
                              value = formatDate(value);
                            }
                            
                            rowData[`${group}.${field}`] = 
                              typeof value === 'object'
                                ? JSON.stringify(value)
                                : value;
                          }
                        });
                      } else {
                        rowData[group] = entry.dynamicFields[group];
                      }
                    });
                  }
                  
                  rowData['Status'] = (
                    <Badge variant={getStatusBadgeVariant(entry.status)}>
                      {entry.status}
                    </Badge>
                  );

                  return (
                    <TableRow 
                      key={entry.id}
                      className={entryIndex % 2 === 0 ? "bg-background" : "bg-muted/20"}
                    >
                      {fieldNames.map((fieldName) => (
                        <TableCell key={`${entry.id}-${fieldName}`} className="whitespace-nowrap py-3">
                          {rowData[fieldName] !== undefined ? (
                            typeof rowData[fieldName] === 'string' && rowData[fieldName].length > 50
                              ? `${rowData[fieldName].substring(0, 50)}...`
                              : rowData[fieldName]
                          ) : (
                            <span className="text-muted-foreground italic">N/A</span>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};