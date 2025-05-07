/* eslint-disable react-hooks/exhaustive-deps*/
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAcademicYearStore } from '@/store/academicYear'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'

const Academicyear = () => {
  const { years, fetchYears, addYear, deleteYear } = useAcademicYearStore()
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })

  useEffect(() => {
    fetchYears()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleAdd = async () => {
    if (!form.name || !form.startDate || !form.endDate) return
    await addYear(form)
    setForm({ name: '', startDate: '', endDate: '' })
  }

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Academic Year</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input name="name" placeholder="e.g. 2024-2025" value={form.name} onChange={handleChange} />
            <Input name="startDate" type="date" value={form.startDate} onChange={handleChange} />
            <Input name="endDate" type="date" value={form.endDate} onChange={handleChange} />
          </div>
          <Button onClick={handleAdd}>Add</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Academic Years</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Academic Year</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {years.map((year) => (
                <TableRow key={year.id}>
                  <TableCell>{year.name}</TableCell>
                  <TableCell>{format(new Date(year.startDate), 'yyyy-MM-dd')}</TableCell>
                  <TableCell>{format(new Date(year.endDate), 'yyyy-MM-dd')}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="destructive" onClick={() => deleteYear(year.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Academicyear
