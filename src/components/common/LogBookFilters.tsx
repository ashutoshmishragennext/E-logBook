import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface FilterOption {
  id: string;
  name: string;
}

interface LogBookFiltersProps {
  academicYears: FilterOption[];
  batches: FilterOption[];
  subjects: FilterOption[];
  modules: FilterOption[];
  selectedAcademicYear: string;
  selectedBatch: string;
  selectedSubject: string;
  selectedModule: string;
  onAcademicYearChange: (value: string) => void;
  onBatchChange: (value: string) => void;
  onSubjectChange: (value: string) => void;
  onModuleChange: (value: string) => void;
  loading: {
    academicYears: boolean;
    batches: boolean;
    subjects: boolean;
    modules: boolean;
  };
}

export const LogBookFilters = ({
  academicYears,
  batches,
  subjects,
  modules,
  selectedAcademicYear,
  selectedBatch,
  selectedSubject,
  selectedModule,
  onAcademicYearChange,
  onBatchChange,
  onSubjectChange,
  onModuleChange,
  loading,
}: LogBookFiltersProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
        <CardDescription>
          Select academic year, batch, subject and module to load the appropriate template
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Academic Year Filter */}
          <div className="space-y-2">
            <Label htmlFor="academic-year">Academic Year</Label>
            <Select
              value={selectedAcademicYear}
              onValueChange={onAcademicYearChange}
              disabled={loading.academicYears}
            >
              <SelectTrigger id="academic-year">
                <SelectValue placeholder="Select Academic Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Batch Filter */}
          <div className="space-y-2">
            <Label htmlFor="batch">Batch</Label>
            <Select
              value={selectedBatch}
              onValueChange={onBatchChange}
              disabled={loading.batches || !selectedAcademicYear}
            >
              <SelectTrigger id="batch">
                <SelectValue placeholder="Select Batch" />
              </SelectTrigger>
              <SelectContent>
                {batches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {batch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Subject Filter */}
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Select
              value={selectedSubject}
              onValueChange={onSubjectChange}
              disabled={loading.subjects || !selectedBatch}
            >
              <SelectTrigger id="subject">
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Module Filter */}
          <div className="space-y-2">
            <Label htmlFor="module">Module</Label>
            <Select
              value={selectedModule}
              onValueChange={onModuleChange}
              disabled={loading.modules || !selectedSubject}
            >
              <SelectTrigger id="module">
                <SelectValue placeholder="Select Module" />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.id} value={module.id}>
                    {module.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};