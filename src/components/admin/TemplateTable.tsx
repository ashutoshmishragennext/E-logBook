// components/TemplateTable.tsx
'use client';

import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { format } from 'date-fns';

interface Field {
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface Group {
  name: string;
  fields: Field[];
}

interface DynamicSchema {
  groups: Group[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  dynamicSchema: DynamicSchema;
  createdAt: string;
  updatedAt: string;
  academicYear: {
    id: string;
    name: string;
  };
  batch: {
    id: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
    code: string;
  };
  module: {
    id: string;
    name: string;
  };
}

interface TemplateTableProps {
  templates: Template[];
}

export default function TemplateTable({ templates }: TemplateTableProps) {
  if (!templates || templates.length === 0) {
    return <div className="text-center py-8">No templates found.</div>;
  }

  // Get field type color
  const getFieldTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'text': 'bg-blue-50 text-blue-800',
      'textarea': 'bg-green-50 text-green-800',
      'number': 'bg-purple-50 text-purple-800',
      'date': 'bg-yellow-50 text-yellow-800',
      'select': 'bg-orange-50 text-orange-800',
      'checkbox': 'bg-indigo-50 text-indigo-800',
      'radio': 'bg-pink-50 text-pink-800',
      'file': 'bg-cyan-50 text-cyan-800'
    };
    
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-8">
      {templates.map((template) => (
        <Card key={template.id} className="shadow-md">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
              <div>
                <CardTitle className="text-xl font-bold">{template.name}</CardTitle>
                <CardDescription className="mt-1">{template.description}</CardDescription>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Created: {format(new Date(template.createdAt), 'PPP')}</div>
                <div>Updated: {format(new Date(template.updatedAt), 'PPP')}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-blue-50">
                {template.academicYear.name}
              </Badge>
              <Badge variant="outline" className="bg-green-50">
                {template.batch.name}
              </Badge>
              <Badge variant="outline" className="bg-purple-50">
                {template.subject.name} ({template.subject.code})
              </Badge>
              <Badge variant="outline" className="bg-amber-50">
                {template.module.name}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableCaption>Template Structure: {template.name}</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/6">Group</TableHead>
                  <TableHead className="w-1/5">Field Label</TableHead>
                  <TableHead className="w-1/6">Type</TableHead>
                  <TableHead className="w-1/6">Required</TableHead>
                  <TableHead className="w-2/6">Options</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {template.dynamicSchema.groups.map((group) => (
                  <React.Fragment key={group.name}>
                    {group.fields.length > 0 ? (
                      group.fields.map((field, fieldIndex) => (
                        <TableRow key={`${group.name}-${field.label}`} className="hover:bg-slate-50">
                          {fieldIndex === 0 ? (
                            <TableCell rowSpan={group.fields.length} className="align-top font-medium bg-gray-50 border-r">
                              {group.name}
                            </TableCell>
                          ) : null}
                          <TableCell className="font-medium">{field.label}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getFieldTypeColor(field.type)}>
                              {field.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {field.required ? (
                              <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Required</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-gray-50">Optional</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            {field.options ? (
                              <div className="flex flex-wrap gap-1">
                                {field.options.map((option) => (
                                  <Badge key={option} variant="outline" className="bg-blue-50 text-xs">
                                    {option}
                                  </Badge>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No fields in this group
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}