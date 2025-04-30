import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";

interface AcademicInfoProps {
  form: any;
  editMode: boolean;
  existingProfile: any | null;
  collegeIdProofFileName: string | null;
  setCollegeIdProofFileName: (name: string | null) => void;
}

export const AcademicInfo = ({
  form,
  editMode,
  existingProfile,
  collegeIdProofFileName,
  setCollegeIdProofFileName,
}: AcademicInfoProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Roll Number */}
      <FormField
        control={form.control}
        name="rollNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Roll Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your roll number"
                {...field}
                readOnly={!editMode || !!existingProfile}
                className={
                  !editMode || existingProfile
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Enrollment Number */}
      <FormField
        control={form.control}
        name="enrollmentNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enrollment Number</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your enrollment number"
                {...field}
                readOnly={!editMode || !!existingProfile}
                className={
                  !editMode || existingProfile
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Admission Batch */}
      <FormField
        control={form.control}
        name="admissionBatch"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Admission Batch</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select admission batch" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const year = 2020 + i;
                  return (
                    <SelectItem
                      key={year}
                      value={year.toString()}
                    >
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Course */}
      <FormField
        control={form.control}
        name="course"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Course</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="MBBS">MBBS</SelectItem>
                <SelectItem value="MD">MD</SelectItem>
                <SelectItem value="MS">MS</SelectItem>
                <SelectItem value="BDS">BDS</SelectItem>
                <SelectItem value="Pharm.D">Pharm.D</SelectItem>
                <SelectItem value="BSc Nursing">BSc Nursing</SelectItem>
                <SelectItem value="MSc Nursing">MSc Nursing</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Current Semester */}
      <FormField
        control={form.control}
        name="currentSemester"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Semester</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select current semester" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i+1} value={(i+1).toString()}>
                    Semester {i+1}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Subject/Specialization */}
      <FormField
        control={form.control}
        name="subject"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject/Specialization</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your subject or specialization"
                {...field}
                readOnly={!editMode}
                className={
                  !editMode
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Branch */}
      <FormField
        control={form.control}
        name="branchId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Branch</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {/* Branch items would be dynamically populated */}
                <SelectItem value="branch-1">Branch 1</SelectItem>
                <SelectItem value="branch-2">Branch 2</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Previous Institution */}
      <FormField
        control={form.control}
        name="previousInstitution"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Previous Institution</FormLabel>
            <FormControl>
              <Input
                placeholder="Enter your previous institution"
                {...field}
                readOnly={!editMode}
                className={
                  !editMode
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Year of Passing */}
      <FormField
        control={form.control}
        name="yearOfPassing"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Year of Passing</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select year of passing" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 20 }, (_, i) => {
                  const year = 2010 + i;
                  return (
                    <SelectItem
                      key={year}
                      value={year.toString()}
                    >
                      {year}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Attempt */}
      <FormField
        control={form.control}
        name="attempt"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Attempt</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select attempt" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Array.from({ length: 10 }, (_, i) => {
                  const attempt = i + 1;
                  return (
                    <SelectItem
                      key={attempt}
                      value={attempt.toString()}
                    >
                      {attempt}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date of Joining */}
      <FormField
        control={form.control}
        name="dateOfJoining"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date of Joining</FormLabel>
            <FormControl>
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="PPP"
                placeholderText="Pick a date"
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                  !editMode && "bg-gray-100 cursor-not-allowed"
                )}
                disabled={!editMode}
                maxDate={new Date()}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
                  control={form.control}
                  name="teacherId"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>
                        <span className="flex items-center gap-2">
                          <span>👨‍🏫 Assign Teacher for Verification</span>
                          {existingProfile && existingProfile.status !== "PENDING" && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs ${
                                existingProfile.status === "APPROVED"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {existingProfile.status}
                            </span>
                          )}
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          value={field.value}
                          disabled={
                            !editMode ||
                            (existingProfile &&
                              existingProfile.status === "APPROVED") ||
                            undefined
                          }
                        >
                          <SelectTrigger
                            className={
                              !editMode ||
                              (existingProfile && existingProfile.status === "APPROVED")
                                ? "bg-gray-200 cursor-not-allowed text-black"
                                : ""
                            }
                          >
                            <SelectValue placeholder="Select a teacher for verification" />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Teacher items would be mapped here from the teachers state */}
                          </SelectContent>
                        </Select>
                      </FormControl>
                      {existingProfile && existingProfile.status === "APPROVED" && (
                        <p className="text-sm text-gray-500 mt-1">
                          Your profile has been {existingProfile.status.toLowerCase()} and can
                          no longer be assigned to a different teacher.
                        </p>
                      )}
                      {existingProfile && existingProfile.status === "REJECTED" && (
                        <p className="text-sm text-gray-500 mt-1">
                          Your profile has been {existingProfile.status.toLowerCase()} and
                          Reason for rejection is: {existingProfile.rejection_reason}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

      {/* Date of Completion */}
      <FormField
        control={form.control}
        name="dateOfCompletion"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Expected Date of Completion</FormLabel>
            <FormControl>
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="PPP"
                placeholderText="Pick a date"
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                  !editMode && "bg-gray-100 cursor-not-allowed"
                )}
                disabled={!editMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Graduation Date */}
      <FormField
        control={form.control}
        name="graduationDate"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Graduation Date</FormLabel>
            <FormControl>
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="PPP"
                placeholderText="Pick a date"
                className={cn(
                  "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500",
                  !editMode && "bg-gray-100 cursor-not-allowed"
                )}
                disabled={!editMode}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Enrollment Status */}
      <FormField
        control={form.control}
        name="enrollmentStatus"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Enrollment Status</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value || "ACTIVE"}
              disabled={!editMode}
            >
              <FormControl>
                <SelectTrigger
                  className={
                    !editMode
                      ? "bg-gray-100 cursor-not-allowed"
                      : ""
                  }
                >
                  <SelectValue placeholder="Select enrollment status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="GRADUATED">Graduated</SelectItem>
                <SelectItem value="DROPOUT">Dropout</SelectItem>
                <SelectItem value="ON_BREAK">On Break</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* College ID Proof Upload */}
      <FormField
        control={form.control}
        name="collegeIdProof"
        render={({ field }) => (
          <FormItem className="col-span-2">
            <FormLabel>College ID Proof</FormLabel>
            <FormControl>
              <div className="flex flex-col items-start space-y-2 w-full">
                {editMode && (
                  <div className="w-full">
                    <UploadButton
                      endpoint="docUploader"
                      onClientUploadComplete={(res) => {
                        if (res.length > 0) {
                          const uploadedFileUrl = res[0].serverData.fileUrl;
                          form.setValue("collegeIdProof", uploadedFileUrl);
                          setCollegeIdProofFileName(res[0].name);
                          toast.success("ID Proof Uploaded");
                        }
                      }}
                      onUploadError={(error) => {
                        toast.error("Upload Error");
                        console.log("Upload Error:", error);
                      }}
                    />
                  </div>
                )}

                {field.value && (
                  <div className="flex items-center gap-2">
                    <a
                      href={field.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      View Uploaded ID
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};