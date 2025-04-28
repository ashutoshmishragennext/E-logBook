import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AcademicInfoFormData {
  rollNo?: string;
  admissionBatch?: string;
  department?: string;
  currentSemester?: number;
  collegeIdProof?: File;
  cgpa?: number;
}

interface AcademicInfoTabProps {
  formData: AcademicInfoFormData;
  handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, type: string) => void;
  isLoading: boolean;
}

const AcademicInfoTab: React.FC<AcademicInfoTabProps> = ({ formData, handleChange, handleSubmit, isLoading }) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Academic Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => handleSubmit(e, 'academic')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Roll Number</label>
              <Input 
                name="rollNo" 
                value={formData.rollNo || ''} 
                onChange={handleChange} 
                placeholder="Enter your roll number"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Admission Batch</label>
              <Input 
                name="admissionBatch" 
                value={formData.admissionBatch || ''} 
                onChange={handleChange} 
                placeholder="E.g., 2022-2026"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input 
                name="department" 
                value={formData.department || ''} 
                onChange={handleChange} 
                placeholder="E.g., Computer Science"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Semester</label>
              <Input 
                name="currentSemester" 
                type="number"
                min="1"
                max="8"
                value={formData.currentSemester || ''} 
                onChange={handleChange} 
                placeholder="E.g., 5"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">College ID Proof</label>
              <Input 
                name="collegeIdProof" 
                type="file"
                onChange={(e) => {
                  const file = e.target.files && e.target.files[0];
                  handleChange({
                    ...e,
                    target: {
                      ...e.target,
                      name: "collegeIdProof",
                      value: file ? file.name : ''
                    }
                  });
                }}
                accept="image/*"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current CGPA</label>
              <Input 
                name="cgpa" 
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa || ''} 
                onChange={handleChange} 
                placeholder="E.g., 8.5"
              />
            </div>
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Academic Information'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AcademicInfoTab;