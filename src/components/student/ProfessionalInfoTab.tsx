import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";

interface ProfessionalInfoProps {
  form: any;
  editMode: boolean;
}

export const ProfessionalInfo = ({
  form,
  editMode,
}: ProfessionalInfoProps) => {
  return (
    <div className="grid md:grid-cols-1 gap-4">
      {/* Previous Experience */}
      <FormField
        control={form.control}
        name="previousExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Previous Experience</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your previous work experience"
                {...field}
                rows={3}
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

      {/* Special Interest */}
      <FormField
        control={form.control}
        name="specialInterest"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Areas of Special Interest</FormLabel>
            <FormControl>
              <Textarea
                placeholder="List your areas of special interest"
                {...field}
                rows={3}
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

      {/* Future Plans */}
      <FormField
        control={form.control}
        name="futurePlan"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Future Plans</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe your future career plans"
                {...field}
                rows={3}
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
    </div>
  );
};