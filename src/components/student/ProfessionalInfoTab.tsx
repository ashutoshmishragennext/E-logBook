// ProfessionalInfoTab.jsx
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ProfessionalInfoTab: React.FC<{
  formData: { [key: string]: any };
  handleChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSubmit: (event: React.FormEvent, type: string) => void;
  isLoading: boolean;
}> = ({ formData, handleChange, handleSubmit, isLoading }) => {
  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          Professional Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={(e) => handleSubmit(e, "professional")}
        >
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Skills</label>
              <Textarea
                name="skills"
                value={formData.skills || ""}
                onChange={handleChange}
                placeholder="Enter your skills (comma separated)"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">LinkedIn Profile</label>
              <Input
                name="linkedinProfile"
                value={formData.linkedinProfile || ""}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourusername"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">GitHub Profile</label>
              <Input
                name="githubProfile"
                value={formData.githubProfile || ""}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Portfolio Website</label>
              <Input
                name="portfolioWebsite"
                value={formData.portfolioWebsite || ""}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Resume/CV</label>
              <Input
                name="resume"
                type="file"
                onChange={(e) => {
                  const customEvent = {
                    target: {
                      name: "resume",
                      value: e.target.files && e.target.files[0]?.name || "",
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleChange(customEvent);
                }}
                accept=".pdf,.doc,.docx"
              />
            </div>
          </div>
          <div className="pt-4">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Professional Information"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ProfessionalInfoTab;