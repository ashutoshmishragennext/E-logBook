'use client';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage,
  FormDescription
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { 
  CalendarIcon, 
  Loader2, 
  Pencil, 
  PlusCircle, 
  Save, 
  Trash, 
  X 
} from 'lucide-react';
// import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the form schema
const professionalInfoSchema = z.object({
  resume: z.any().optional(), // File upload handled separately
  previousExperience: z.string().optional(),
  futurePlan: z.string().optional(),
  skills: z.array(
    z.object({
      name: z.string().min(1, "Skill name is required"),
      proficiency: z.string().min(1, "Proficiency level is required")
    })
  ).optional(),
  certifications: z.array(
    z.object({
      name: z.string().min(1, "Certification name is required"),
      issuingOrganization: z.string().min(1, "Issuing organization is required"),
      issueDate: z.date().nullable().optional(),
      expiryDate: z.date().nullable().optional(),
      credentialId: z.string().optional(),
      credentialUrl: z.string().url("Please enter a valid URL").optional().or(z.string().length(0))
    })
  ).optional(),
  workExperience: z.array(
    z.object({
      title: z.string().min(1, "Job title is required"),
      company: z.string().min(1, "Company name is required"),
      location: z.string().optional(),
      startDate: z.date().nullable().optional(),
      endDate: z.date().nullable().optional(),
      isCurrentPosition: z.boolean().default(false),
      description: z.string().optional()
    })
  ).optional()
});

interface ProfessionalInfoProps {
  userId: string;
  existingProfile?: {
    id?: string;
    resume?: string | null;
    previousExperience?: string;
    futurePlan?: string;
    skills?: { name: string; proficiency: string }[];
    certifications?: {
      name: string;
      issuingOrganization: string;
      issueDate?: Date | null;
      expiryDate?: Date | null;
      credentialId?: string;
      credentialUrl?: string;
    }[];
    workExperience?: {
      title: string;
      company: string;
      location?: string;
      startDate?: Date | null;
      endDate?: Date | null;
      isCurrentPosition?: boolean;
      description?: string;
    }[];
  };
  onProfileUpdate?: (updatedProfile: any) => void;
}

export default function ProfessionalInfoComponent({ userId, existingProfile, onProfileUpdate }: ProfessionalInfoProps) {
  const [editMode, setEditMode] = useState(!existingProfile);
  const [submitting, setSubmitting] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreview, setResumePreview] = useState(existingProfile?.resume || null);
  
  // Create form with zod validation
  const form = useForm({
    resolver: zodResolver(professionalInfoSchema),
    defaultValues: {
      previousExperience: existingProfile?.previousExperience || "",
      futurePlan: existingProfile?.futurePlan || "",
      skills: existingProfile?.skills?.length ? existingProfile.skills : [{ name: "", proficiency: "Beginner" }],
      certifications: existingProfile?.certifications?.length ? existingProfile.certifications : [{ 
        name: "", 
        issuingOrganization: "", 
        issueDate: null, 
        expiryDate: null, 
        credentialId: "",
        credentialUrl: ""
      }],
      workExperience: existingProfile?.workExperience?.length ? existingProfile.workExperience : [{
        title: "",
        company: "",
        location: "",
        startDate: null,
        endDate: null,
        isCurrentPosition: false,
        description: ""
      }]
    }
  });
  
  // Field arrays for repeatable sections
  const { 
    fields: skillsFields, 
    append: appendSkill, 
    remove: removeSkill 
  } = useFieldArray({
    control: form.control,
    name: "skills",
  });
  
  const { 
    fields: certificationFields, 
    append: appendCertification, 
    remove: removeCertification 
  } = useFieldArray({
    control: form.control,
    name: "certifications",
  });
  
  const { 
    fields: experienceFields, 
    append: appendExperience, 
    remove: removeExperience 
  } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });
  
  // Handle file upload for resume
  interface ResumeChangeEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & { files: FileList };
  }

  const handleResumeChange = (e: ResumeChangeEvent): void => {
    const file = e.target.files[0];
    if (file) {
      setResumeFile(file);
      
      // Create preview link
      setResumePreview(file.name);
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: { previousExperience: any; futurePlan: any; skills: string | any[]; certifications: any[]; workExperience: any[]; }) => {
    setSubmitting(true);
    
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("userId", userId);
      
      // Add text fields
      formData.append("previousExperience", data.previousExperience || "");
      formData.append("futurePlan", data.futurePlan || "");
      
      // Add arrays as JSON strings
      if (data.skills?.length) {
        formData.append("skills", JSON.stringify(data.skills));
      }
      
      if (data.certifications?.length) {
        const processedCertifications = data.certifications.map(cert => ({
          ...cert,
          issueDate: cert.issueDate ? cert.issueDate.toISOString() : null,
          expiryDate: cert.expiryDate ? cert.expiryDate.toISOString() : null,
        }));
        formData.append("certifications", JSON.stringify(processedCertifications));
      }
      
      if (data.workExperience?.length) {
        const processedExperience = data.workExperience.map(exp => ({
          ...exp,
          startDate: exp.startDate ? exp.startDate.toISOString() : null,
          endDate: exp.endDate ? exp.endDate.toISOString() : null,
        }));
        formData.append("workExperience", JSON.stringify(processedExperience));
      }
      
      // Add resume file if exists
      if (resumeFile) {
        formData.append("resume", resumeFile);
      }
      
      // Determine if this is a create or update operation
      const url = existingProfile?.id 
        ? `/api/student-profiles/${existingProfile.id}/professional-info` 
        : "/api/student-profiles/professional-info";
      
      const method = existingProfile?.id ? "PUT" : "POST";
      
      const response = await fetch(url, {
        method,
        body: formData,
      });
      
      if (response.ok) {
        const updatedProfile = await response.json();
        // toast({
        //   title: "Success",
        //   description: existingProfile?.id 
        //     ? "Professional information updated successfully" 
        //     : "Professional information saved successfully",
        // });
        
        // Exit edit mode and pass updated profile to parent
        setEditMode(false);
        if (onProfileUpdate) {
          onProfileUpdate(updatedProfile);
        }
      } else {
        const errorData = await response.json();
        // toast({
        //   title: "Error",
        //   description: errorData.message || "Failed to save professional information",
        //   variant: "destructive",
        // });
      }
    } catch (error) {
      console.error("Error saving professional information:", error);
      // toast({
      //   title: "Error",
      //   description: "An unexpected error occurred",
      //   variant: "destructive",
      // });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <Card className="w-full mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Professional Information</CardTitle>
          <CardDescription>
            Your professional experience, skills, and future plans
          </CardDescription>
        </div>
        {existingProfile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEditMode(!editMode)}
            disabled={submitting}
          >
            {editMode ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </>
            ) : (
              <>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {!editMode && existingProfile ? (
          <div className="space-y-6">
            {/* Resume */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Resume</h4>
              {resumePreview ? (
                <div className="flex items-center">
                  <a 
                    href={typeof resumePreview === 'string' && resumePreview.startsWith('http') ? resumePreview : '#'} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary underline flex items-center"
                  >
                    {typeof resumePreview === 'string' ? 
                      (resumePreview.includes('/') ? resumePreview.split('/').pop() : resumePreview) : 
                      'View Resume'}
                  </a>
                </div>
              ) : (
                <p className="text-muted-foreground">No resume uploaded</p>
              )}
            </div>
            
            {/* Previous Experience */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Previous Experience</h4>
              {existingProfile.previousExperience ? (
                <p className="whitespace-pre-line">{existingProfile.previousExperience}</p>
              ) : (
                <p className="text-muted-foreground">No previous experience added</p>
              )}
            </div>
            
            {/* Future Plans */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-1">Future Plans</h4>
              {existingProfile.futurePlan ? (
                <p className="whitespace-pre-line">{existingProfile.futurePlan}</p>
              ) : (
                <p className="text-muted-foreground">No future plans added</p>
              )}
            </div>
            
            {/* Skills */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Skills</h4>
              {existingProfile.skills?.length ? (
                <div className="flex flex-wrap gap-2">
                  {existingProfile.skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {skill.name} ({skill.proficiency})
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No skills added</p>
              )}
            </div>
            
            {/* Certifications */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Certifications</h4>
              {existingProfile.certifications?.length ? (
                <div className="space-y-3">
                  {existingProfile.certifications.map((cert, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <h5 className="font-medium">{cert.name}</h5>
                      <p className="text-sm">Issued by: {cert.issuingOrganization}</p>
                      {cert.issueDate && (
                        <p className="text-sm">
                          Issue Date: {format(new Date(cert.issueDate), "PPP")}
                        </p>
                      )}
                      {cert.expiryDate && (
                        <p className="text-sm">
                          Expiry Date: {format(new Date(cert.expiryDate), "PPP")}
                        </p>
                      )}
                      {cert.credentialId && (
                        <p className="text-sm">Credential ID: {cert.credentialId}</p>
                      )}
                      {cert.credentialUrl && (
                        <a 
                          href={cert.credentialUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary text-sm underline"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No certifications added</p>
              )}
            </div>
            
            {/* Work Experience */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Work Experience</h4>
              {existingProfile.workExperience?.length ? (
                <div className="space-y-3">
                  {existingProfile.workExperience.map((exp, index) => (
                    <div key={index} className="border rounded-md p-3">
                      <h5 className="font-medium">{exp.title}</h5>
                      <p className="text-sm">{exp.company}{exp.location ? `, ${exp.location}` : ''}</p>
                      <p className="text-sm">
                        {exp.startDate && format(new Date(exp.startDate), "MMM yyyy")} - {' '}
                        {exp.isCurrentPosition ? 'Present' : exp.endDate ? format(new Date(exp.endDate), "MMM yyyy") : ''}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2 whitespace-pre-line">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No work experience added</p>
              )}
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Resume Upload */}
              <FormItem>
                <FormLabel>Resume</FormLabel>
                <FormDescription>Upload your most recent resume (PDF recommended)</FormDescription>
                <div className="mt-2">
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeChange}
                    className="w-full"
                  />
                </div>
                {resumePreview && (
                  <div className="flex items-center mt-2">
                    <span className="text-sm text-muted-foreground mr-2">Current:</span>
                    <span className="text-sm">{
                      typeof resumePreview === 'string' ? 
                        (resumePreview.includes('/') ? resumePreview.split('/').pop() : resumePreview) : 
                        'Uploaded Resume'
                    }</span>
                  </div>
                )}
              </FormItem>
              
              <Separator />
              
              {/* Previous Experience */}
              <FormField
                control={form.control}
                name="previousExperience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Experience</FormLabel>
                    <FormDescription>
                      Briefly describe your previous work or educational experience
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="I have previously worked as..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Future Plan */}
              <FormField
                control={form.control}
                name="futurePlan"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Future Plans</FormLabel>
                    <FormDescription>
                      What are your career aspirations or future educational plans?
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="In the future, I plan to..."
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator />
              
              {/* Skills */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Skills</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your technical and professional skills
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendSkill({ name: "", proficiency: "Beginner" })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Skill
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {skillsFields.map((field, index) => (
                    <div key={field.id} className="flex items-end gap-4 border rounded-md p-4">
                      <FormField
                        control={form.control}
                        name={`skills.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormLabel>Skill Name</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. JavaScript, Project Management" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name={`skills.${index}.proficiency`}
                        render={({ field }) => (
                          <FormItem className="w-1/3">
                            <FormLabel>Proficiency</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select level" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                                <SelectItem value="Expert">Expert</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSkill(index)}
                        disabled={skillsFields.length === 1}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
              
              <Separator />
              
              {/* Certifications */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-medium">Certifications</h3>
                    <p className="text-sm text-muted-foreground">
                      Add your professional certifications
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => appendCertification({ 
                      name: "", 
                      issuingOrganization: "", 
                      issueDate: null, 
                      expiryDate: null, 
                      credentialId: "",
                      credentialUrl: ""
                    })}
                  >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Certification
                  </Button>
                </div>
                
                <div className="space-y-6">
                  {certificationFields.map((field, index) => (
                    <div key={field.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">Certification #{index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeCertification(index)}
                          disabled={certificationFields.length === 1}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 pt-4">
                {existingProfile && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditMode(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Information
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );}
     