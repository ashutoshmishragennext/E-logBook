



import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface PersonalInfoTabProps {
  formData: {
    name?: string;
    email?: string;
    mobileNo?: string;
    dateOfBirth?: string;
    gender?: string;
    profilePhoto?: File;
  };
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>, type: string) => void;
  isLoading: boolean;
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ formData, handleChange, handleSubmit, isLoading }) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Personal Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={(e) => handleSubmit(e, 'personal')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                name="name" 
                value={formData.name || ''} 
                onChange={handleChange} 
                placeholder="Enter your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input 
                name="email" 
                type="email"
                value={formData.email || ''} 
                onChange={handleChange} 
                placeholder="Enter your email address"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Mobile Number</label>
              <Input 
                name="mobileNo" 
                value={formData.mobileNo || ''} 
                onChange={handleChange} 
                placeholder="Enter your mobile number"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Date of Birth</label>
              <Input 
                name="dateOfBirth" 
                type="date"
                value={formData.dateOfBirth || ''} 
                onChange={handleChange} 
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender</label>
              <select 
                name="gender"
                value={formData.gender || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Profile Photo</label>
              <Input 
                name="profilePhoto" 
                type="file"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleChange({
                      target: {
                        name: "profilePhoto",
                        value: e.target.files[0].name
                      }
                    } as unknown as React.ChangeEvent<HTMLInputElement>);
                  }
                }}
                accept="image/*"
              />
            </div>
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Personal Information'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoTab;
