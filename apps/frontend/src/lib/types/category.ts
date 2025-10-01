export interface CustomField {
  id: string
  name: string
  type: "text" | "textarea" | "select" | "multiselect" | "number" | "date" | "checkbox"
  required: boolean
  options?: string[]
  placeholder?: string
}

export interface Category {
  id: string
  name: string
  description?: string
  firstResponseSLA: number
  resolutionSLA: number
  customFields: CustomField[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCategoryDto {
  name: string
  description?: string
  firstResponseSLA: number
  resolutionSLA: number
  customFields: CustomField[]
  isActive?: boolean
}

export interface UpdateCategoryDto {
  name?: string
  description?: string
  firstResponseSLA?: number
  resolutionSLA?: number
  customFields?: CustomField[]
  isActive?: boolean
}
