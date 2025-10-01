"use client"

import { useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { useCreateCategory, useUpdateCategory } from "@/src/lib/hooks/useCategories"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "../ui/Dialog"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Label } from "../ui/Label"
import { Textarea } from "../ui/TextArea"
import { Switch } from "../ui/Switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import { Separator } from "../ui/Separator"
import { Plus, Trash2, Loader2 } from "lucide-react"
import { useToast } from "@/src/hooks/useToast"
import type { Category, CustomField, CreateCategoryDto } from "@/src/lib/types/category"


interface CategoryDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    category?: Category | null
}

interface CategoryFormData {
    name: string
    description: string
    firstResponseSLA: number
    resolutionSLA: number
    isActive: boolean
    customFields: CustomField[]
}

export function CategoryDialog({ open, onOpenChange, category }: CategoryDialogProps) {
    const { toast } = useToast()
    const createCategory = useCreateCategory()
    const updateCategory = useUpdateCategory()
    const isEditing = !!category

    const {
        register,
        handleSubmit,
        control,
        reset,
        watch,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: "",
            description: "",
            firstResponseSLA: 240,
            resolutionSLA: 1440,
            isActive: true,
            customFields: [],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control,
        name: "customFields",
    })

    useEffect(() => {
        if (category) {
            reset({
                name: category.name,
                description: category.description || "",
                firstResponseSLA: category.firstResponseSLA,
                resolutionSLA: category.resolutionSLA,
                isActive: category.isActive,
                customFields: category.customFields,
            })
        } else {
            reset({
                name: "",
                description: "",
                firstResponseSLA: 240,
                resolutionSLA: 1440,
                isActive: true,
                customFields: [],
            })
        }
    }, [category, reset])

    const onSubmit = async (data: CategoryFormData) => {
        try {
            // CORRECCIÓN: Convertir explícitamente a números enteros
            const payload: CreateCategoryDto = {
                name: data.name,
                description: data.description || undefined,
                firstResponseSLA: parseInt(String(data.firstResponseSLA), 10),
                resolutionSLA: parseInt(String(data.resolutionSLA), 10),
                isActive: data.isActive,
                customFields: data.customFields,
            }

            console.log("Payload a enviar:", JSON.stringify(payload, null, 2))
            console.log("Tipos:", {
                firstResponseSLA: typeof payload.firstResponseSLA,
                resolutionSLA: typeof payload.resolutionSLA
            })

            if (isEditing) {
                await updateCategory.mutateAsync({
                    id: category.id,
                    data: payload,
                })
                toast({
                    title: "Category updated",
                    description: "The category has been updated successfully.",
                })
            } else {
                await createCategory.mutateAsync(payload)
                toast({
                    title: "Category created",
                    description: "The category has been created successfully.",
                })
            }

            onOpenChange(false)
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "An error occurred",
                variant: "destructive",
            })
        }
    }

    const addCustomField = () => {
        append({
            id: `field_${Date.now()}`,
            name: "",
            type: "text",
            required: false,
            options: [],
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Category" : "Create New Category"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Update the category details and SLA configuration."
                            : "Create a new category with custom fields and SLA targets."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Category Name *</Label>
                            <Input
                                id="name"
                                {...register("name", { required: "Name is required" })}
                                placeholder="e.g., Hardware Issues"
                            />
                            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                {...register("description")}
                                placeholder="Brief description of this category"
                                rows={3}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="isActive"
                                checked={watch("isActive")}
                                onCheckedChange={(checked) => setValue("isActive", checked)}
                            />
                            <Label htmlFor="isActive">Active</Label>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">SLA Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstResponseSLA">First Response SLA (minutes) *</Label>
                                <Input
                                    id="firstResponseSLA"
                                    type="number"
                                    {...register("firstResponseSLA", {
                                        required: "First response SLA is required",
                                        min: { value: 1, message: "Must be at least 1 minute" },
                                        valueAsNumber: true, // CORRECCIÓN: Esto convierte automáticamente a número
                                    })}
                                    placeholder="240"
                                />
                                {errors.firstResponseSLA && (
                                    <p className="text-sm text-destructive">{errors.firstResponseSLA.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    {watch("firstResponseSLA") >= 60
                                        ? `${Math.floor(watch("firstResponseSLA") / 60)} hours ${watch("firstResponseSLA") % 60 > 0 ? `${watch("firstResponseSLA") % 60} minutes` : ""}`
                                        : `${watch("firstResponseSLA")} minutes`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="resolutionSLA">Resolution SLA (minutes) *</Label>
                                <Input
                                    id="resolutionSLA"
                                    type="number"
                                    {...register("resolutionSLA", {
                                        required: "Resolution SLA is required",
                                        min: { value: 1, message: "Must be at least 1 minute" },
                                        valueAsNumber: true, // CORRECCIÓN: Esto convierte automáticamente a número
                                    })}
                                    placeholder="1440"
                                />
                                {errors.resolutionSLA && <p className="text-sm text-destructive">{errors.resolutionSLA.message}</p>}
                                <p className="text-xs text-muted-foreground">
                                    {watch("resolutionSLA") >= 60
                                        ? `${Math.floor(watch("resolutionSLA") / 60)} hours ${watch("resolutionSLA") % 60 > 0 ? `${watch("resolutionSLA") % 60} minutes` : ""}`
                                        : `${watch("resolutionSLA")} minutes`}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Custom Fields</h3>
                            <Button type="button" variant="outline" size="sm" onClick={addCustomField}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Field
                            </Button>
                        </div>

                        {fields.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No custom fields. Click "Add Field" to create one.</p>
                        ) : (
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <Card key={field.id}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm">Field {index + 1}</CardTitle>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="space-y-2">
                                                    <Label>Field Name</Label>
                                                    <Input
                                                        {...register(`customFields.${index}.name`, {
                                                            required: "Field name is required",
                                                        })}
                                                        placeholder="e.g., Device Type"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Field Type</Label>
                                                    <Select
                                                        value={watch(`customFields.${index}.type`)}
                                                        onValueChange={(value) => setValue(`customFields.${index}.type`, value as any)}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="text">Text</SelectItem>
                                                            <SelectItem value="textarea">Text Area</SelectItem>
                                                            <SelectItem value="number">Number</SelectItem>
                                                            <SelectItem value="select">Select</SelectItem>
                                                            <SelectItem value="date">Date</SelectItem>
                                                            <SelectItem value="checkbox">Checkbox</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            {watch(`customFields.${index}.type`) === "select" && (
                                                <div className="space-y-2">
                                                    <Label>Options (comma-separated)</Label>
                                                    <Input
                                                        placeholder="Option 1, Option 2, Option 3"
                                                        onChange={(e) => {
                                                            const options = e.target.value
                                                                .split(",")
                                                                .map((opt) => opt.trim())
                                                                .filter(Boolean)
                                                            setValue(`customFields.${index}.options`, options)
                                                        }}
                                                        defaultValue={field.options?.join(", ")}
                                                    />
                                                </div>
                                            )}

                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    id={`required-${index}`}
                                                    checked={watch(`customFields.${index}.required`)}
                                                    onCheckedChange={(checked) => setValue(`customFields.${index}.required`, checked)}
                                                />
                                                <Label htmlFor={`required-${index}`}>Required field</Label>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isEditing ? "Update Category" : "Create Category"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}