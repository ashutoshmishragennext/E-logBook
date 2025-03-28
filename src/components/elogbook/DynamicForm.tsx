/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AcademicYear,
  Batch,
  LogBookDynamicSchema,
  Module,
  Subject
} from '@/db/schema';
import { useState } from 'react';

interface LogBookTemplateFormProps {
  academicYears: AcademicYear[];
  batches: Batch[];
  subjects: Subject[];
  modules: Module[];
  onSubmit: (template: any) => void;
}

export function LogBookTemplateForm({
  academicYears,
 
  onSubmit
}: LogBookTemplateFormProps) {
  const [formData, setFormData] = useState({
    academicYearId: '',
    batchId: '',
    subjectId: '',
    moduleId: '',
    name: '',
    description: '',
  });

  const [dynamicSchema, setDynamicSchema] = useState<LogBookDynamicSchema>({
    groups: []
  });

  const [currentGroup, setCurrentGroup] = useState({
    groupName: '',
    fields: [] as {
      fieldName: string;
      fieldLabel: string;
      fieldType: string;
      isRequired: boolean;
    }[]
  });

  const [currentField, setCurrentField] = useState({
    fieldName: '',
    fieldLabel: '',
    fieldType: 'text',
    isRequired: false
  });

  // Handle adding a group
  const handleAddGroup = () => {
    if (currentGroup.groupName) {
      setDynamicSchema(prev => ({
        groups: [...prev.groups, { ...currentGroup, fields: [] }]
      }));
      setCurrentGroup({ groupName: '', fields: [] });
    }
  };

  // Handle adding a field to the current group
  const handleAddField = () => {
    if (currentField.fieldName && currentField.fieldLabel) {
      setCurrentGroup(prev => ({
        ...prev,
        fields: [...prev.fields, currentField]
      }));

      // After adding the field to current group, reset current field state
      setCurrentField({
        fieldName: '',
        fieldLabel: '',
        fieldType: 'text',
        isRequired: false
      });
    }
  };

  // Handle final form submission
  const handleSubmit = () => {
    onSubmit({
      ...formData,
      dynamicSchema
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Select 
          value={formData.academicYearId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, academicYearId: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select Academic Year" />
          </SelectTrigger>
          <SelectContent>
            {academicYears.map(year => (
              <SelectItem key={year.id} value={year.id}>
                {year.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Similar Select components for Batch, Subject, Module */}

        <Input 
          placeholder="Log Book Template Name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
        />

        <Textarea 
          placeholder="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} 
        />
      </div>

      {/* Dynamic Schema Creation Section */}
      <div>
        <h3>Create Dynamic Schema</h3>

        {/* Display current groups and their fields */}
        <div className="space-y-2">
          {dynamicSchema.groups.map((group, groupIndex) => (
            <div key={groupIndex}>
              <h4>Group: {group.groupName}</h4>
              <div className="space-y-1">
                {group.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex}>
                    <span>{field.fieldLabel} ({field.fieldType})</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Group Name Input */}
        <div className="my-2">
          <Input
            placeholder="Group Name"
            value={currentGroup.groupName}
            onChange={(e) => setCurrentGroup(prev => ({ ...prev, groupName: e.target.value }))}
          />
          <Button onClick={handleAddGroup}>Add Group</Button>
        </div>

        {/* Field Inputs */}
        <div className="my-2">
          <Input
            placeholder="Field Name"
            value={currentField.fieldName}
            onChange={(e) => setCurrentField(prev => ({ ...prev, fieldName: e.target.value }))}
          />
          <Input
            placeholder="Field Label"
            value={currentField.fieldLabel}
            onChange={(e) => setCurrentField(prev => ({ ...prev, fieldLabel: e.target.value }))}
          />
          <Select
            value={currentField.fieldType}
            onValueChange={(value) => setCurrentField(prev => ({ ...prev, fieldType: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Field Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="select">Select</SelectItem>
              <SelectItem value="textarea">Textarea</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Required Checkbox */}
          <div>
            <label>
              <input
                type="checkbox"
                checked={currentField.isRequired}
                onChange={(e) => setCurrentField(prev => ({ ...prev, isRequired: e.target.checked }))}
              />
              Required
            </label>
          </div>

          <Button onClick={handleAddField}>Add Field</Button>
        </div>
      </div>

      <Button onClick={handleSubmit}>Create Log Book Template</Button>
    </div>
  );
}
