/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { Plus, Trash2 } from 'lucide-react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod schema for form validation
const LogBookTemplateSchema = z.object({
  academicYearId: z.string().uuid(),
  batchId: z.string().uuid(),
  subjectId: z.string().uuid(),
  moduleId: z.string().uuid(),
  name: z.string().min(1, 'Template name is required'),
  description: z.string().optional(),
  dynamicSchema: z.object({
    groups: z.array(
      z.object({
        name: z.string().min(1, 'Group name is required'),
        fields: z.array(
          z.object({
            label: z.string().min(1, 'Field label is required'),
            type: z.enum(['text', 'number', 'date', 'textarea']),
            required: z.boolean().optional(),
          })
        )
      })
    )
  }).optional()
});

export default function LogBookTemplateForm() {
  // Hardcoded IDs
  const ACADEMIC_YEAR_ID = '2f8ab354-1f21-4d0f-ad41-87a39e44b0be';
  const BATCH_ID = '86f6cdd7-281c-4eba-b423-e835360b012e';
  const MODULE_ID = '13f35a6b-2c2a-4386-b99e-d5685127afe2';
  const SUBJECT_ID = 'e92e5996-bfcc-4097-8605-63dd00f4156c';
  const user = useCurrentUser();
  const userId = user?.id || 'current-user-id'; // Replace with actual user ID

  // Form state and validation
  const { 
    control, 
    register, 
    handleSubmit, 
    watch, 
    setValue, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(LogBookTemplateSchema),
    defaultValues: {
      academicYearId: ACADEMIC_YEAR_ID,
      batchId: BATCH_ID,
      subjectId: SUBJECT_ID,
      moduleId: MODULE_ID,
      dynamicSchema: { groups: [] }
    }
  });

  // Add a new group to dynamic schema
  const addGroup = () => {
    const currentGroups = watch('dynamicSchema.groups') || [];
    setValue('dynamicSchema.groups', [
      ...currentGroups, 
      { name: '', fields: [{ label: '', type: 'text', required: false }] }
    ]);
  };

  // Remove a group from dynamic schema
  const removeGroup = (groupIndex: number) => {
    const currentGroups = watch('dynamicSchema.groups') || [];
    const updatedGroups = currentGroups.filter((_, index) => index !== groupIndex);
    setValue('dynamicSchema.groups', updatedGroups);
  };

  // Add a field to a specific group
  const addField = (groupIndex: number) => {
    const currentGroups = watch('dynamicSchema.groups') || [];
    const updatedGroups = [...currentGroups];
    updatedGroups[groupIndex].fields.push({ 
      label: '', 
      type: 'text', 
      required: false 
    });
    setValue('dynamicSchema.groups', updatedGroups);
  };

  // Remove a field from a specific group
  const removeField = (groupIndex: number, fieldIndex: number) => {
    const currentGroups = watch('dynamicSchema.groups') || [];
    const updatedGroups = [...currentGroups];
    updatedGroups[groupIndex].fields = updatedGroups[groupIndex].fields
      .filter((_, index) => index !== fieldIndex);
    setValue('dynamicSchema.groups', updatedGroups);
  };

  // Submit form handler


  const onSubmit = async (data: any) => {
    try {
      const response = await fetch('/api/log-book-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          createdBy: userId // Replace with actual user ID
        })
      });

      if (response.ok) {
        // Handle successful submission
        alert('Log Book Template Created Successfully!');
        // Optionally reset form or redirect
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Submission error', error);
      alert('Failed to create log book template');
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create Log Book Template</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden input fields for hardcoded IDs */}
          <input 
            type="hidden" 
            {...register('academicYearId')} 
            value={ACADEMIC_YEAR_ID} 
          />
          <input 
            type="hidden" 
            {...register('batchId')} 
            value={BATCH_ID} 
          />
          <input 
            type="hidden" 
            {...register('subjectId')} 
            value={SUBJECT_ID} 
          />
          <input 
            type="hidden" 
            {...register('moduleId')} 
            value={MODULE_ID} 
          />

          {/* Template Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2">Template Name</label>
              <Input 
                {...register('name')}
                placeholder="Enter template name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div>
              <label className="block mb-2">Description (Optional)</label>
              <Input 
                {...register('description')}
                placeholder="Enter template description"
              />
            </div>
          </div>

          {/* Dynamic Schema Builder */}
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold">Template Groups</h3>
              <Button 
                type="button" 
                variant="outline" 
                onClick={addGroup}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Group
              </Button>
            </div>

            {watch('dynamicSchema.groups')?.map((group, groupIndex) => (
              <Card key={groupIndex} className="mb-4">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <Input 
                      placeholder="Group Name"
                      {...register(`dynamicSchema.groups.${groupIndex}.name`)}
                      className="w-3/4 mr-2"
                    />
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="icon"
                      onClick={() => removeGroup(groupIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Fields within Group */}
                  <div className="space-y-2">
                    {group.fields.map((field, fieldIndex) => (
                      <div 
                        key={fieldIndex} 
                        className="flex items-center space-x-2"
                      >
                        <Input 
                          placeholder="Field Label"
                          {...register(`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.label`)}
                          className="w-1/3"
                        />
                        <Controller
                          name={`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.type`}
                          control={control}
                          render={({ field: selectField }) => (
                            <select 
                              onChange={selectField.onChange}
                              value={selectField.value}
                              className="w-1/3 p-2 border rounded"
                            >
                              {['text', 'number', 'date', 'textarea'].map((type) => (
                                <option key={type} value={type}>
                                  {type}
                                </option>
                              ))}
                            </select>
                          )}
                        />
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon"
                          onClick={() => removeField(groupIndex, fieldIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => addField(groupIndex)}
                      className="mt-2"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Add Field
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button type="submit" className="w-full">
            Create Log Book Template
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}