"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCategories, useDeleteCategory } from "@/src/lib/hooks/useCategories"
import { CategoriesTable } from "@/src/components/categories/categories-table"
import { CategoryDialog } from "@/src/components/categories/category-dialog"
import { Button } from "@/src/components/ui/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/Card"
import { Switch } from "@/src/components/ui/Switch"
import { Label } from "@/src/components/ui/Label"
import { Plus, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/src/components/ui/Alert"
import type { Category } from "@/src/lib/types/category"


export default function CategoriesPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [includeInactive, setIncludeInactive] = useState(false)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)

    const { data: categories, isLoading, error } = useCategories(includeInactive)
    const deleteCategory = useDeleteCategory()

    // Redirect if not manager
    if (status === "authenticated" && session?.user?.role !== "MANAGER") {
        router.push("/tickets")
        return null
    }

    if (status === "loading" || isLoading) {
        return (
            <div className="container mx-auto py-6">
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container mx-auto py-6">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error loading categories</AlertTitle>
                    <AlertDescription>{error instanceof Error ? error.message : "An unknown error occurred"}</AlertDescription>
                </Alert>
            </div>
        )
    }

    const handleEdit = (category: Category) => {
        setSelectedCategory(category)
        setDialogOpen(true)
    }

    const handleDelete = async (categoryId: string) => {
        if (confirm("Are you sure you want to deactivate this category?")) {
            try {
                await deleteCategory.mutateAsync(categoryId)
            } catch (error) {
                console.error("Failed to delete category:", error)
            }
        }
    }

    const handleDialogClose = () => {
        setDialogOpen(false)
        setSelectedCategory(null)
    }

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Categories Management</h1>
                    <p className="text-muted-foreground mt-2">Manage ticket categories and configure SLA policies</p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    New Category
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>All Categories</CardTitle>
                            <CardDescription>Configure categories with custom fields and SLA targets</CardDescription>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Switch id="include-inactive" checked={includeInactive} onCheckedChange={setIncludeInactive} />
                            <Label htmlFor="include-inactive">Show inactive</Label>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <CategoriesTable categories={categories || []} onEdit={handleEdit} onDelete={handleDelete} />
                </CardContent>
            </Card>

            <CategoryDialog open={dialogOpen} onOpenChange={handleDialogClose} category={selectedCategory} />
        </div>
    )
}
