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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/auth";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Edit } from "lucide-react";

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
  // const router = useRouter();
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

  const handleEditEntry = (entry: LogBookEntry) => {
    if (!entry.template) return;
    
    // router.push({
    //   pathname: '/logbook-entries',
    //   query: {
    //     academicYearId: entry.template.academicYearId,
    //     batchId: entry.template.batchId,
    //     subjectId: entry.template.subjectId,
    //     moduleId: entry.template.moduleId,
    //     editEntryId: entry.id
    //   }
    // });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Log Book Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No log book entries found.</p>
        </CardContent>
      </Card>
    );
  }

  // Get all unique field names in original order from first entry
  const getFieldNames = (entry: LogBookEntry) => {
    const fields = [];
    
    // Add template info first
    if (entry.template) {
      fields.push('Template');
      if (entry.template.academicYear) fields.push('Academic Year');
      if (entry.template.batch) fields.push('Batch');
      if (entry.template.subject) fields.push('Subject');
      if (entry.template.module) fields.push('Module');
    }
    
    fields.push('Created At');
    
    // Add dynamic fields in their original order
    if (entry.dynamicFields) {
      Object.keys(entry.dynamicFields).forEach(group => {
        if (typeof entry.dynamicFields[group] === 'object') {
          Object.keys(entry.dynamicFields[group]).forEach(field => {
            fields.push(`${group}.${field}`);
          });
        } else {
          fields.push(group);
        }
      });
    }
    
    fields.push('Status');
    fields.push('Actions');
    
    return fields;
  };

  const fieldNames = entries.length > 0 ? getFieldNames(entries[0]) : [];

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader>
          <CardTitle>My Log Book Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto shadow-sm rounded-lg border">
            <Table className="min-w-full">
              <TableHeader className="bg-muted/50">
                <TableRow>
                  {fieldNames.map((fieldName) => (
                    <TableHead key={fieldName} className="whitespace-nowrap">
                      {fieldName.split('.').pop()}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => {
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
                  
                  rowData['Created At'] = new Date(entry.createdAt).toLocaleDateString();
                  
                  // Dynamic fields
                  if (entry.dynamicFields) {
                    Object.keys(entry.dynamicFields).forEach(group => {
                      if (typeof entry.dynamicFields[group] === 'object') {
                        Object.keys(entry.dynamicFields[group]).forEach(field => {
                          rowData[`${group}.${field}`] = 
                            typeof entry.dynamicFields[group][field] === 'object'
                              ? JSON.stringify(entry.dynamicFields[group][field])
                              : entry.dynamicFields[group][field];
                        });
                      } else {
                        rowData[group] = entry.dynamicFields[group];
                      }
                    });
                  }
                  
                  rowData['Status'] = entry.status;
                  rowData['Actions'] = (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  );

                  return (
                    <TableRow key={entry.id}>
                      {fieldNames.map((fieldName) => (
                        <TableCell key={`${entry.id}-${fieldName}`} className="whitespace-nowrap">
                          {rowData[fieldName] !== undefined ? (
                            typeof rowData[fieldName] === 'string' && rowData[fieldName].length > 50
                              ? `${rowData[fieldName].substring(0, 50)}...`
                              : rowData[fieldName]?.toString() || 'N/A'
                          ) : (
                            'N/A'
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