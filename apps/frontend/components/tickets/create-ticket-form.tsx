"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCreateTicket } from "@/lib/hooks/useTickets"
import { useCategories } from "@/lib/hooks/useCategories"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/TextArea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Label } from "@/components/ui/Label"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Loader2, AlertCircle, Send } from "lucide-react"
import { TicketPriority } from "@prisma/client"
import type { TicketPriority as TicketPriorityType } from "@/lib/types/ticket"

interface CustomField {
  id: string
  name: string
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "date"
  required: boolean
  options?: string[]
  placeholder?: string
}

export function CreateTicketForm() {
  const router = useRouter()
  const createTicket = useCreateTicket()
  const { data: categories, isLoading: categoriesLoading } = useCategories()

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priority: TicketPriority.MEDIUM as TicketPriorityType | undefined,
  })
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>({})
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (formData.categoryId && categories) {
      const category = categories.find((c) => c.id === formData.categoryId)
      setSelectedCategory(category)
      setCustomFieldValues({})
    }
  }, [formData.categoryId, categories])

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const handleCustomFieldChange = (fieldId: string, value: any) => {
    setCustomFieldValues((prev) => ({ ...prev, [fieldId]: value }))
    if (errors[fieldId]) {
      setErrors((prev) => ({ ...prev, [fieldId]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    // Validate custom fields
    if (selectedCategory?.customFields) {
      selectedCategory.customFields.forEach((field: CustomField) => {
        if (field.required && !customFieldValues[field.id]) {
          newErrors[field.id] = `${field.name} is required`
        }
      })
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    try {
      const ticket = await createTicket.mutateAsync({
        ...formData,
        customFieldValues,
      })

      router.push(`/tickets/${ticket.id}`)
    } catch (error: any) {
      setErrors({ submit: error.message || "Failed to create ticket. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderCustomField = (field: CustomField) => {
    const value = customFieldValues[field.id] || ""

    switch (field.type) {
      case "text":
        return (
          <Input
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        )

      case "textarea":
        return (
          <Textarea
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        )

      case "number":
        return (
          <Input
            type="number"
            value={value}
            onChange={(e) => handleCustomFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
          />
        )

      case "date":
        return <Input type="date" value={value} onChange={(e) => handleCustomFieldChange(field.id, e.target.value)} />

      case "select":
        return (
          <Select value={value} onValueChange={(val) => handleCustomFieldChange(field.id, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "multiselect":
        return (
          <div className="space-y-2">
            {field.options?.map((option) => (
              <label key={option} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={(value as string[])?.includes(option) || false}
                  onChange={(e) => {
                    const currentValues = (value as string[]) || []
                    const newValues = e.target.checked
                      ? [...currentValues, option]
                      : currentValues.filter((v) => v !== option)
                    handleCustomFieldChange(field.id, newValues)
                  }}
                  className="rounded border-gray-300"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        )

      default:
        return null
    }
  }

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Ticket Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {errors.submit && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Brief summary of your issue"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-destructive">*</span>
            </Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleInputChange("categoryId", value)}>
              <SelectTrigger className={errors.categoryId ? "border-destructive" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && <p className="text-sm text-destructive">{errors.categoryId}</p>}
            {selectedCategory?.description && (
              <p className="text-sm text-muted-foreground">{selectedCategory.description}</p>
            )}
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="CRITICAL">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Provide detailed information about your issue"
              rows={6}
              className={errors.description ? "border-destructive" : ""}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          {/* Dynamic Custom Fields */}
          {selectedCategory?.customFields && selectedCategory.customFields.length > 0 && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-medium">Additional Information</h3>
              {selectedCategory.customFields.map((field: CustomField) => (
                <div key={field.id} className="space-y-2">
                  <Label htmlFor={field.id}>
                    {field.name}
                    {field.required && <span className="text-destructive"> *</span>}
                  </Label>
                  {renderCustomField(field)}
                  {errors[field.id] && <p className="text-sm text-destructive">{errors[field.id]}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => router.push("/tickets")} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Create Ticket
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
