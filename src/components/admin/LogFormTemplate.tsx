// import React, { useState, useEffect } from 'react';
// import { 
//   Card, 
//   CardContent, 
//   CardHeader, 
//   CardTitle 
// } from '@/components/ui/card';
// import { 
//   Select, 
//   SelectContent, 
//   SelectItem, 
//   SelectTrigger, 
//   SelectValue 
// } from '@/components/ui/select';
// import { Input } from '@/components/ui/input';
// import { Button } from '@/components/ui/button';
// import { Plus, Trash2 } from 'lucide-react';
// import { z } from 'zod';
// import { useForm, Controller } from 'react-hook-form';
// import { zodResolver } from '@hookform/resolvers/zod';

// // Zod schema for form validation
// const LogBookTemplateSchema = z.object({
//   academicYearId: z.string().uuid('Select an academic year'),
//   batchId: z.string().uuid('Select a batch'),
//   subjectId: z.string().uuid('Select a subject'),
//   moduleId: z.string().uuid('Select a module'),
//   name: z.string().min(1, 'Template name is required'),
//   description: z.string().optional(),
//   dynamicSchema: z.object({
//     groups: z.array(
//       z.object({
//         name: z.string().min(1, 'Group name is required'),
//         fields: z.array(
//           z.object({
//             label: z.string().min(1, 'Field label is required'),
//             type: z.enum(['text', 'number', 'date', 'textarea']),
//             required: z.boolean().optional(),
//           })
//         )
//       })
//     )
//   }).optional()
// });

// export default function LogBookTemplateForm() {
//   // State for dropdowns
//   const [academicYears, setAcademicYears] = useState<{ id: string; name: string }[]>([]);
//   const [batches, setBatches] = useState<{ id: string; name: string }[]>([]);
//   const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
//   const [modules, setModules] = useState<{ id: string; name: string }[]>([]);

//   // Form state and validation
//   const { 
//     control, 
//     register, 
//     handleSubmit, 
//     watch, 
//     setValue, 
//     formState: { errors } 
//   } = useForm({
//     resolver: zodResolver(LogBookTemplateSchema),
//     defaultValues: {
//       dynamicSchema: { groups: [] }
//     }
//   });

//   // Watch selected values to dynamically update dependent dropdowns
//   const watchAcademicYear = watch('academicYearId');
//   const watchBatch = watch('batchId');
//   const watchSubject = watch('subjectId');

//   // Fetch initial data
//   useEffect(() => {
//     const fetchInitialData = async () => {
//       try {
//         // Fetch academic years
//         const academicYearsResponse = await fetch('/api/academic-years');
//         const academicYearsData = await academicYearsResponse.json();
//         setAcademicYears(academicYearsData);
//       } catch (error) {
//         console.error('Failed to fetch initial data', error);
//       }
//     };
//     fetchInitialData();
//   }, []);

//   // Fetch batches when academic year is selected
//   useEffect(() => {
//     const fetchBatches = async () => {
//       if (watchAcademicYear) {
//         try {
//           const batchesResponse = await fetch(`/api/batches?academicYearId=${watchAcademicYear}`);
//           const batchesData = await batchesResponse.json();
//           setBatches(batchesData);
//           // Reset dependent fields
//           setValue('batchId', '');
//           setValue('subjectId', '');
//           setValue('moduleId', '');
//         } catch (error) {
//           console.error('Failed to fetch batches', error);
//         }
//       }
//     };
//     fetchBatches();
//   }, [watchAcademicYear, setValue]);

//   // Fetch subjects when batch is selected
//   useEffect(() => {
//     const fetchSubjects = async () => {
//       if (watchBatch) {
//         try {
//           const subjectsResponse = await fetch(`/api/subjects?batchId=${watchBatch}`);
//           const subjectsData = await subjectsResponse.json();
//           setSubjects(subjectsData);
//           // Reset dependent fields
//           setValue('subjectId', '');
//           setValue('moduleId', '');
//         } catch (error) {
//           console.error('Failed to fetch subjects', error);
//         }
//       }
//     };
//     fetchSubjects();
//   }, [watchBatch, setValue]);

//   // Fetch modules when subject is selected
//   useEffect(() => {
//     const fetchModules = async () => {
//       if (watchSubject) {
//         try {
//           const modulesResponse = await fetch(`/api/modules?subjectId=${watchSubject}`);
//           const modulesData = await modulesResponse.json();
//           setModules(modulesData);
//           // Reset module field
//           setValue('moduleId', '');
//         } catch (error) {
//           console.error('Failed to fetch modules', error);
//         }
//       }
//     };
//     fetchModules();
//   }, [watchSubject, setValue]);

//   // Add a new group to dynamic schema
//   const addGroup = () => {
//     const currentGroups = watch('dynamicSchema.groups') || [];
//     setValue('dynamicSchema.groups', [
//       ...currentGroups, 
//       { name: '', fields: [{ label: '', type: 'text', required: false }] }
//     ]);
//   };

//   // Remove a group from dynamic schema
//   const removeGroup = (groupIndex: number) => {
//     const currentGroups = watch('dynamicSchema.groups') || [];
//     const updatedGroups = currentGroups.filter((_, index) => index !== groupIndex);
//     setValue('dynamicSchema.groups', updatedGroups);
//   };

//   // Add a field to a specific group
//   const addField = (groupIndex: number) => {
//     const currentGroups = watch('dynamicSchema.groups') || [];
//     const updatedGroups = [...currentGroups];
//     updatedGroups[groupIndex].fields.push({ 
//       label: '', 
//       type: 'text', 
//       required: false 
//     });
//     setValue('dynamicSchema.groups', updatedGroups);
//   };

//   // Remove a field from a specific group
//   const removeField = (groupIndex: number, fieldIndex: number) => {
//     const currentGroups = watch('dynamicSchema.groups') || [];
//     const updatedGroups = [...currentGroups];
//     updatedGroups[groupIndex].fields = updatedGroups[groupIndex].fields
//       .filter((_, index) => index !== fieldIndex);
//     setValue('dynamicSchema.groups', updatedGroups);
//   };

//   // Submit form handler
//   const onSubmit = async (data: any) => {
//     try {
//       const response = await fetch('/api/log-book-templates', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           ...data,
//           createdBy: 'current-user-id' // Replace with actual user ID
//         })
//       });

//       if (response.ok) {
//         // Handle successful submission
//         alert('Log Book Template Created Successfully!');
//         // Optionally reset form or redirect
//       } else {
//         const errorData = await response.json();
//         alert(`Error: ${errorData.error}`);
//       }
//     } catch (error) {
//       console.error('Submission error', error);
//       alert('Failed to create log book template');
//     }
//   };

//   return (
//     <Card className="w-full max-w-4xl mx-auto">
//       <CardHeader>
//         <CardTitle>Create Log Book Template</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//           {/* Academic Context Selectors */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-2">Academic Year</label>
//               <Controller
//                 name="academicYearId"
//                 control={control}
//                 render={({ field }) => (
//                   <Select 
//                     onValueChange={field.onChange}
//                     value={field.value}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Academic Year" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {academicYears.map((year) => (
//                         <SelectItem key={year.id} value={year.id}>
//                           {year.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.academicYearId && (
//                 <p className="text-red-500 text-sm">
//                   {errors.academicYearId.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block mb-2">Batch</label>
//               <Controller
//                 name="batchId"
//                 control={control}
//                 render={({ field }) => (
//                   <Select 
//                     onValueChange={field.onChange}
//                     value={field.value}
//                     disabled={!watchAcademicYear}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Batch" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {batches.map((batch) => (
//                         <SelectItem key={batch.id} value={batch.id}>
//                           {batch.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.batchId && (
//                 <p className="text-red-500 text-sm">
//                   {errors.batchId.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-2">Subject</label>
//               <Controller
//                 name="subjectId"
//                 control={control}
//                 render={({ field }) => (
//                   <Select 
//                     onValueChange={field.onChange}
//                     value={field.value}
//                     disabled={!watchBatch}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Subject" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {subjects.map((subject) => (
//                         <SelectItem key={subject.id} value={subject.id}>
//                           {subject.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.subjectId && (
//                 <p className="text-red-500 text-sm">
//                   {errors.subjectId.message}
//                 </p>
//               )}
//             </div>

//             <div>
//               <label className="block mb-2">Module</label>
//               <Controller
//                 name="moduleId"
//                 control={control}
//                 render={({ field }) => (
//                   <Select 
//                     onValueChange={field.onChange}
//                     value={field.value}
//                     disabled={!watchSubject}
//                   >
//                     <SelectTrigger>
//                       <SelectValue placeholder="Select Module" />
//                     </SelectTrigger>
//                     <SelectContent>
//                       {modules.map((module) => (
//                         <SelectItem key={module.id} value={module.id}>
//                           {module.name}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 )}
//               />
//               {errors.moduleId && (
//                 <p className="text-red-500 text-sm">
//                   {errors.moduleId.message}
//                 </p>
//               )}
//             </div>
//           </div>

//           {/* Template Details */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block mb-2">Template Name</label>
//               <Input 
//                 {...register('name')}
//                 placeholder="Enter template name"
//               />
//               {errors.name && (
//                 <p className="text-red-500 text-sm">
//                   {errors.name.message}
//                 </p>
//               )}
//             </div>
//             <div>
//               <label className="block mb-2">Description (Optional)</label>
//               <Input 
//                 {...register('description')}
//                 placeholder="Enter template description"
//               />
//             </div>
//           </div>

//           {/* Dynamic Schema Builder */}
//           <div className="mt-4">
//             <div className="flex justify-between items-center mb-2">
//               <h3 className="text-lg font-semibold">Template Groups</h3>
//               <Button 
//                 type="button" 
//                 variant="outline" 
//                 onClick={addGroup}
//               >
//                 <Plus className="mr-2 h-4 w-4" /> Add Group
//               </Button>
//             </div>

//             {watch('dynamicSchema.groups')?.map((group, groupIndex) => (
//               <Card key={groupIndex} className="mb-4">
//                 <CardContent className="p-4">
//                   <div className="flex justify-between items-center mb-3">
//                     <Input 
//                       placeholder="Group Name"
//                       {...register(`dynamicSchema.groups.${groupIndex}.name`)}
//                       className="w-3/4 mr-2"
//                     />
//                     <Button 
//                       type="button" 
//                       variant="destructive" 
//                       size="icon"
//                       onClick={() => removeGroup(groupIndex)}
//                     >
//                       <Trash2 className="h-4 w-4" />
//                     </Button>
//                   </div>

//                   {/* Fields within Group */}
//                   <div className="space-y-2">
//                     {group.fields.map((field, fieldIndex) => (
//                       <div 
//                         key={fieldIndex} 
//                         className="flex items-center space-x-2"
//                       >
//                         <Input 
//                           placeholder="Field Label"
//                           {...register(`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.label`)}
//                           className="w-1/3"
//                         />
//                         <Controller
//                           name={`dynamicSchema.groups.${groupIndex}.fields.${fieldIndex}.type`}
//                           control={control}
//                           render={({ field: selectField }) => (
//                             <Select 
//                               onValueChange={selectField.onChange}
//                               value={selectField.value}
//                             >
//                               <SelectTrigger className="w-1/3">
//                                 <SelectValue placeholder="Field Type" />
//                               </SelectTrigger>
//                               <SelectContent>
//                                 {['text', 'number', 'date', 'textarea'].map((type) => (
//                                   <SelectItem key={type} value={type}>
//                                     {type}
//                                   </SelectItem>
//                                 ))}
//                               </SelectContent>
//                             </Select>
//                           )}
//                         />
//                         <Button 
//                           type="button" 
//                           variant="destructive" 
//                           size="icon"
//                           onClick={() => removeField(groupIndex, fieldIndex)}
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </Button>
//                       </div>
//                     ))}
//                     <Button 
//                       type="button" 
//                       variant="outline" 
//                       onClick={() => addField(groupIndex)}
//                       className="mt-2"
//                     >
//                       <Plus className="mr-2 h-4 w-4" /> Add Field
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>

//           <Button type="submit" className="w-full">
//             Create Log Book Template
//           </Button>
//         </form>
//       </CardContent>
//     </Card>
//   );
// }


import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCurrentUser } from '@/hooks/auth';

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