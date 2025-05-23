/* eslint-disable react-hooks/exhaustive-deps*/
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrentUser } from "@/hooks/auth";
import { College, useCollegeStore } from "@/store/college";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { UploadButton } from "@/utils/uploadthing";

const Profile = () => {
  const user = useCurrentUser();
  const userId = user?.id;
  const { college, fetchCollegeDetail, updateCollege } = useCollegeStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editedCollege, setEditedCollege] = useState<Partial<College>>({});

  useEffect(() => {
    if (userId) {
      fetchCollegeDetail(userId);
    }
  }, [userId]);

  useEffect(() => {
    if (college) {
      setEditedCollege(college);
    }
  }, [college]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditedCollege((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      if (!college?.id) return;

      console.log("Saving college data:", editedCollege);

      const response = await fetch(`/api/college?id=${college.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedCollege),
      });

      if (!response.ok) throw new Error("Failed to update college");

      const updatedCollege = await response.json();
      updateCollege(updatedCollege);
      setIsEditing(false);

      toast("College details updated successfully");
    } catch (error) {
      console.error("Error updating college:", error);
      toast("Failed to update college details");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {college && (
        <Card className="w-full shadow-md">
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-xl flex items-center gap-4">
              <Image
                width={48}
                height={48}
                src={
                  isEditing && editedCollege.logo
                    ? editedCollege.logo
                    : college.logo
                }
                alt={college.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              {isEditing && (
                <UploadButton
                  endpoint="imageUploader"
                  className="h-16 text-xs mt-2"
                  appearance={{ button: "h-9 text-md p-3" }}
                  onClientUploadComplete={(res) => {
                    if (res.length > 0) {
                      setEditedCollege((prev) => ({
                        ...prev,
                        logo: res[0].serverData.fileUrl,
                      }));
                    }
                  }}
                  onUploadError={(error) => {
                    console.error("Upload Error:", error);
                    toast.error("Logo upload failed: " + error.message);
                  }}
                />
              )}

              {isEditing ? (
                <div className="flex flex-col gap-2">
                  <Input
                    name="name"
                    value={editedCollege.name || ""}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="code"
                    value={editedCollege.code || ""}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                `${college.name} (${college.code})`
              )}
            </CardTitle>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div>
              <strong>Address:</strong>
              {isEditing ? (
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    name="address"
                    value={editedCollege.address || ""}
                    onChange={handleInputChange}
                    placeholder="Street address"
                  />
                  <Input
                    name="city"
                    value={editedCollege.city || ""}
                    onChange={handleInputChange}
                    placeholder="City"
                  />
                  <Input
                    name="state"
                    value={editedCollege.state || ""}
                    onChange={handleInputChange}
                    placeholder="State"
                  />
                  <Input
                    name="country"
                    value={editedCollege.country || ""}
                    onChange={handleInputChange}
                    placeholder="Country"
                  />
                </div>
              ) : (
                ` ${college.address}, ${college.city}, ${college.state}, ${college.country}`
              )}
            </div>

            <div>
              <strong>Phone:</strong>
              {isEditing ? (
                <Input
                  name="phone"
                  value={editedCollege.phone || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                ` ${college.phone}`
              )}
            </div>

            <div>
              <strong>Email:</strong>
              {isEditing ? (
                <Input
                  name="email"
                  value={editedCollege.email || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                ` ${college.email}`
              )}
            </div>

            <div>
              <strong>Website:</strong>
              {isEditing ? (
                <Input
                  name="website"
                  value={editedCollege.website || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                />
              ) : (
                <a
                  href={college.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  {college.website}
                </a>
              )}
            </div>

            <div>
              <strong>Description:</strong>
              {isEditing ? (
                <Textarea
                  name="description"
                  value={editedCollege.description || ""}
                  onChange={handleInputChange}
                  className="mt-1"
                  rows={4}
                />
              ) : (
                ` ${college.description}`
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Profile;
