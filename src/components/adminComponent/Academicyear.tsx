/* eslint-disable react-hooks/exhaustive-deps*/
'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useAcademicYearStore } from '@/store/academicYear'
import { format } from 'date-fns'
import React, { useEffect, useState } from 'react'
import DeleteConfirmation from "../common/DeleteComfirmation"
import { toast } from 'sonner'

const Academicyear = () => {
  const { years, fetchYears, addYear, deleteYear } = useAcademicYearStore()
  const [form, setForm] = useState({ name: '', startDate: '', endDate: '' })
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);
  const [errors, setErrors] = useState({
    name: '',
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    fetchYears()
  }, [])

  const validateForm = () => {
    let valid = true
    const newErrors = {
      name: '',
      startDate: '',
      endDate: ''
    }

    // Validate name format (YYYY-YYYY)
    if (!/^\d{4}-\d{4}$/.test(form.name)) {
      newErrors.name = 'Academic year must be in format YYYY-YYYY (e.g. 2024-2025)'
      valid = false
    } else {
      // Check if the years are consecutive
      const [startYear, endYear] = form.name.split('-').map(Number)
      if (endYear !== startYear + 1) {
        newErrors.name = 'End year must be exactly 1 year after start year'
        valid = false
      }
      
      // Check for duplicate academic year
      if (years.some(year => year.name === form.name)) {
        newErrors.name = 'This academic year already exists'
        valid = false
      }
    }

    // Validate dates
    if (!form.startDate) {
      newErrors.startDate = 'Start date is required'
      valid = false
    }

    if (!form.endDate) {
      newErrors.endDate = 'End date is required'
      valid = false
    }

    // Check if dates match the academic year
    if (form.startDate && form.endDate) {
      const startDate = new Date(form.startDate)
      const endDate = new Date(form.endDate)
      
      const startYear = startDate.getFullYear()
      const endYear = endDate.getFullYear()
      
      const [academicStartYear] = form.name.split('-').map(Number)
      
      if (form.name && academicStartYear !== startYear) {
        newErrors.startDate = 'Start date year must match the first year in academic year'
        valid = false
      }
      
      if (form.name && (academicStartYear + 1) !== endYear) {
        newErrors.endDate = 'End date year must match the second year in academic year'
        valid = false
      }
      
      if (startDate >= endDate) {
        newErrors.endDate = 'End date must be after start date'
        valid = false
      }
    }

    setErrors(newErrors)
    return valid
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    // Clear error when user types
    if (errors[e.target.name as keyof typeof errors]) {
      setErrors({ ...errors, [e.target.name]: '' })
    }
  }

  const handleAdd = async () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form')
      return
    }

    try {
      await addYear(form)
      setForm({ name: '', startDate: '', endDate: '' })
      toast.success('Academic year added successfully')
    } catch (error) {
      console.error(error)
      toast.error('Failed to add academic year')
    }
  }

  const handleDelete = async (id: string) => {
    setConfirmText(`Are you sure you want to delete this academic year?`);
    setOnConfirmCallback(() => async () => {
      try {
        await deleteYear(id)
        toast.success('Academic year deleted successfully')
      } catch (error) {
        console.error(error)
        toast.error('Failed to delete academic year')
      }
      setIsDeleteModalOpen(false);
    });
    setIsDeleteModalOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Academic Year Management</h1>
      <Card>
        <CardHeader>
          <CardTitle>Add Academic Year</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Academic Year</label>
              <Input 
                name="name" 
                placeholder="e.g. 2024-2025" 
                value={form.name} 
                onChange={handleChange} 
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              <Input 
                name="startDate" 
                type="date" 
                value={form.startDate} 
                onChange={handleChange} 
              />
              {errors.startDate && <p className="text-sm text-red-500">{errors.startDate}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              <Input 
                name="endDate" 
                type="date" 
                value={form.endDate} 
                onChange={handleChange} 
              />
              {errors.endDate && <p className="text-sm text-red-500">{errors.endDate}</p>}
            </div>
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
                    <Button variant="destructive" onClick={() => handleDelete(year.id)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <DeleteConfirmation
        text={confirmText}
        onConfirm={() => {
          if (onConfirmCallback) {
            onConfirmCallback();
          }
        }}
        isOpen={isDeleteModalOpen}
        setIsOpen={setIsDeleteModalOpen} 
      /> 
    </div>
  )
}

export default Academicyear