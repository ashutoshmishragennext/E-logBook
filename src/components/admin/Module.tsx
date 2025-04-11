/* eslint-disable @typescript-eslint/no-explicit-any*/
"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";


export default function ModulePage() {
  const [modules, setModules] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectMap, setSubjectMap] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [subjectRes, moduleRes] = await Promise.all([
        fetch("/api/subject"),
        fetch("/api/module"),
      ]);

      const subjectsData = await subjectRes.json();
      const modulesData = await moduleRes.json();

      const map: Record<string, string> = {};
      subjectsData.forEach((s: any) => {
        map[s.id] = s.name;
      });

      setSubjects(subjectsData);
      setModules(modulesData);
      setSubjectMap(map);
    };

    fetchData();
  }, []);

  const handleSubmit = async () => {
    if (!name || !selectedSubject) {
      alert("Please fill all fields");
      return;
    }

    const res = await fetch("/api/module", {
      method: "POST",
      body: JSON.stringify({
        name,
        subjectId: selectedSubject,
      }),
    });

    if (res.ok) {
      alert( "Module created successfully" );
      setName("");

      const updated = await fetch("/api/module");
      const updatedData = await updated.json();
      setModules(updatedData);
    } else {
      alert( "Failed to create module");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Module</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Module Name</Label>
            <Input
              placeholder="Enter module name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label>Select Subject</Label>
            <Select onValueChange={setSelectedSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit}>Create Module</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Modules</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100 text-left">
              <tr>
                <th className="p-2 border">Module Name</th>
                <th className="p-2 border">Subject</th>
              </tr>
            </thead>
            <tbody>
              {modules.map((mod: any) => (
                <tr key={mod.id} className="border-t">
                  <td className="p-2 border">{mod.name}</td>
                  <td className="p-2 border">
                    {subjectMap[mod.subjectId] || "Unknown"}
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
