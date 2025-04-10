'use client'

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
// import { toast } from "@/components/ui/use-toast"
import { format } from "date-fns"

type AcademicYear = {
  id: string
  name: string
  startDate: string
  endDate: string
}

const AcademicYearPage = () => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [form, setForm] = useState({
    name: "",
    startDate: "",
    endDate: ""
  })

  const fetchAcademicYears = async () => {
    const res = await fetch("/api/academicYears")
    const data = await res.json()
    // Sort by endDate descending
    const sorted = data.sort((a: AcademicYear, b: AcademicYear) =>
      new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )
    setAcademicYears(sorted)
  }

  useEffect(() => {
    fetchAcademicYears()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCreateAcademicYear = async () => {
    const { name, startDate, endDate } = form
    if (!name || !startDate || !endDate) return alert( "All fields are required" )

    const res = await fetch("/api/academicYears", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })

    if (res.ok) {
      alert("Academic year created" )
      setForm({ name: "", startDate: "", endDate: "" })
      fetchAcademicYears()
    } else {
      alert("Failed to create academic year")
    }
  }

  const currentYear = academicYears[0]

  return (
    <div className="max-w-4xl mx-auto py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Current Academic Year</CardTitle>
        </CardHeader>
        <CardContent>
          {currentYear ? (
            <div className="text-lg font-semibold">
              {currentYear.name} ({format(new Date(currentYear.startDate), "PPP")} -{" "}
              {format(new Date(currentYear.endDate), "PPP")})
            </div>
          ) : (
            <div className="text-gray-500">No academic year set</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Academic Year</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Name</Label>
              <Input name="name" value={form.name} onChange={handleInputChange} placeholder="e.g., 2024-2025" />
            </div>
            <div>
              <Label>Start Date</Label>
              <Input type="date" name="startDate" value={form.startDate} onChange={handleInputChange} />
            </div>
            <div>
              <Label>End Date</Label>
              <Input type="date" name="endDate" value={form.endDate} onChange={handleInputChange} />
            </div>
          </div>
          <Button onClick={handleCreateAcademicYear}>Create</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm text-left border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Name</th>
                <th className="p-2 border">Start Date</th>
                <th className="p-2 border">End Date</th>
              </tr>
            </thead>
            <tbody>
              {academicYears.map((year) => (
                <tr key={year.id}>
                  <td className="p-2 border">{year.name}</td>
                  <td className="p-2 border">{format(new Date(year.startDate), "PPP")}</td>
                  <td className="p-2 border">{format(new Date(year.endDate), "PPP")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

export default AcademicYearPage
