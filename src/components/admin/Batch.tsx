/* eslint-disable @typescript-eslint/no-explicit-any */
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
// import { toast } from "@/components/ui/use-toast";

export default function Batch() {
  const [academicYears, setAcademicYears] = useState([]);
  const [batches, setBatches] = useState([]);
  const [batchName, setBatchName] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [academicYearMap, setAcademicYearMap] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    const fetchData = async () => {
      const [yearRes, batchRes] = await Promise.all([
        fetch("/api/academicYears"),
        fetch("/api/phase"),
      ]);

      const years = await yearRes.json();
      const batches = await batchRes.json();

      // Create a map of academicYearId -> name
      const yearMap: Record<string, string> = {};
      years.forEach((y: any) => {
        yearMap[y.id] = y.name;
      });

      setAcademicYears(years);
      setBatches(batches);
      setAcademicYearMap(yearMap);
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!batchName || !selectedYear) {
      alert("Fill all fields");
      return;
    }

    const res = await fetch("/api/phase", {
      method: "POST",
      body: JSON.stringify({
        name: batchName,
        academicYearId: selectedYear,
      }),
    });

    if (res.ok) {
      alert("Batch created successfully");
      setBatchName("");
      const updated = await fetch("/api/phase");
      const updatedData = await updated.json();
      setBatches(updatedData);
    } else {
      alert("Error creating batch");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Batch</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Batch Name</Label>
            <Input
              placeholder="Enter batch name"
              value={batchName}
              onChange={(e) => setBatchName(e.target.value)}
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
          <Button onClick={handleSubmit}>Create Batch</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Batches</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Batch Name</th>
                <th className="p-2 border">Academic Year ID</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((batch: any) => (
                <tr key={batch.id} className="border-t">
                  <td className="p-2 border">{batch.name}</td>
                  <td className="p-2 border">
                    {academicYearMap[batch.academicYearId] || "Unknown"}
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
