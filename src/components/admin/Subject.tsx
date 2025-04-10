"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SubjectsPage() {
  const [academicYears, setAcademicYears] = useState([]);
  const [phases, setPhases] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [phaseMap, setPhaseMap] = useState<Record<string, string>>({});

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedPhase, setSelectedPhase] = useState("");

  useEffect(() => {
    const fetchInitialData = async () => {
      const [yearRes, subjectRes] = await Promise.all([
        fetch("/api/academicYears"),
        fetch("/api/subject"),
      ]);

      const years = await yearRes.json();
      const subjects = await subjectRes.json();

      setAcademicYears(years);
      setSubjects(subjects);
    };

    fetchInitialData();
  }, []);

  // Fetch phases based on academic year
  useEffect(() => {
    const fetchPhases = async () => {
      if (!selectedYear) return;

      const res = await fetch(`/api/phase?academicYears=${selectedYear}`);
      const data = await res.json();

      const map: Record<string, string> = {};
      data.forEach((p: any) => {
        map[p.id] = p.name;
      });

      setPhases(data);
      setPhaseMap(map);
    };

    fetchPhases();
  }, [selectedYear]);

  const handleSubmit = async () => {
    if (!name || !code || !selectedPhase) {
      alert("Please fill all fields");
      return;
    }

    const res = await fetch("/api/subject", {
      method: "POST",
      body: JSON.stringify({
        name,
        code,
        phaseId: selectedPhase,
      }),
    });

    if (res.ok) {
      alert("Subject created successfully");
      setName("");
      setCode("");

      const updated = await fetch("/api/subject");
      const updatedData = await updated.json();
      setSubjects(updatedData);
    } else {
      alert("Failed to create subject");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Subject</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Subject Name</Label>
            <Input
              placeholder="Enter subject name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Subject Code</Label>
            <Input
              placeholder="Enter subject code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </div>
          <div>
            <Label>Academic Year</Label>
            <Select onValueChange={setSelectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((year: any) => (
                  <SelectItem key={year.id} value={year.id}>
                    {year.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Select Phase (Batch)</Label>
            <Select onValueChange={setSelectedPhase}>
              <SelectTrigger>
                <SelectValue placeholder="Select a batch" />
              </SelectTrigger>
              <SelectContent>
                {phases.map((p: any) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit}>Create Subject</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Subjects</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Code</th>
                <th className="p-2 border">Batch</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((sub: any) => (
                <tr key={sub.id} className="border-t">
                  <td className="p-2 border">{sub.name}</td>
                  <td className="p-2 border">{sub.code}</td>
                  <td className="p-2 border">
                    {phaseMap[sub.phaseId] || "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
