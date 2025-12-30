"use client"

import { useState } from "react"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "@/components/ui/sonner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { createAsset, getAssetTypes, uploadAssetImage } from "@/lib/actions/assets"
import { Loader2, Upload, X } from "lucide-react"
import { AssetImage } from "./AssetImage"

interface CreateAssetDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateAssetDialog({ open, onOpenChange }: CreateAssetDialogProps) {
  const queryClient = useQueryClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    assetTypeId: "",
    serialNumber: "",
    purchaseDate: "",
    purchasePrice: "",
    notes: "",
  })

  // Fetch asset types
  const { data: assetTypes = [] } = useQuery({
    queryKey: ["assetTypes"],
    queryFn: getAssetTypes,
    enabled: open,
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Invalid file type", {
          description: "Please select an image file",
          duration: 3000,
        })
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please select an image smaller than 5MB",
          duration: 3000,
        })
        return
      }
      setImageFile(file)
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!imageFile) {
      toast.error("Image required", {
        description: "Please upload an asset image",
        duration: 3000,
      })
      return
    }

    setIsSubmitting(true)
    try {
      // Upload image first
      const imageUrl = await uploadAssetImage(imageFile)
      
      // Create asset
      await createAsset({
        name: formData.name,
        assetTypeId: formData.assetTypeId,
        serialNumber: formData.serialNumber || undefined,
        purchaseDate: formData.purchaseDate || undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        imageUrl,
        notes: formData.notes || undefined,
      })

      await queryClient.invalidateQueries({ queryKey: ["assets"] })

      toast.success("Asset created successfully", {
        description: `Asset ${formData.name} has been added`,
        duration: 3000,
      })
      onOpenChange(false)
      // Reset form
      setFormData({
        name: "",
        assetTypeId: "",
        serialNumber: "",
        purchaseDate: "",
        purchasePrice: "",
        notes: "",
      })
      setImageFile(null)
      setImagePreview(null)
    } catch (error) {
      console.error("Error creating asset:", error)
      toast.error("Failed to create asset", {
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        duration: 5000,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: "",
      assetTypeId: "",
      serialNumber: "",
      purchaseDate: "",
      purchasePrice: "",
      notes: "",
    })
    setImageFile(null)
    setImagePreview(null)
    onOpenChange(false)
  }

  const selectedAssetType = assetTypes.find((type) => type.id === formData.assetTypeId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0">
          <DialogTitle>Add Asset</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Asset Name <span className="text-[#df1c41]">*</span>
              </Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., MacBook Pro 16-inch"
                className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Asset Type <span className="text-[#df1c41]">*</span>
              </Label>
              <Select value={formData.assetTypeId} onValueChange={(value) => setFormData({ ...formData, assetTypeId: value })}>
                <SelectTrigger className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px]">
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name.charAt(0).toUpperCase() + type.name.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">
                Asset Image <span className="text-[#df1c41]">*</span>
              </Label>
              {imagePreview ? (
                <div className="relative">
                  <div className="relative h-48 w-full rounded-xl overflow-hidden border border-[#dfe1e7]">
                    <img
                      src={imagePreview}
                      alt="Asset preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    required
                  />
                  <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <Upload className="h-3 w-3" />
                    <span>Max size: 5MB. Supported formats: JPG, PNG, WebP</span>
                  </div>
                </div>
              )}
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="additional-info">
                <AccordionTrigger className="text-sm font-medium text-[#666d80]">
                  Additional Information
                </AccordionTrigger>
                <AccordionContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Serial Number</Label>
                    <Input
                      value={formData.serialNumber}
                      onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                      placeholder="Enter serial number"
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Purchase Date</Label>
                    <Input
                      type="date"
                      value={formData.purchaseDate}
                      onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Purchase Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.purchasePrice}
                      onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                      placeholder="0.00"
                      className="h-[52px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] placeholder:text-[#818898]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-[#666d80] leading-[1.5] tracking-[0.28px]">Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Enter any additional notes"
                      className="min-h-[100px] rounded-xl border-[#dfe1e7] text-base tracking-[0.32px] resize-none placeholder:text-[#a4acb9]"
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <div className="flex items-center justify-end gap-3.5 pt-4 px-6 pb-6 flex-shrink-0 border-t">
            <Button type="button" onClick={handleCancel} variant="outline" size="md" className="w-[128px]">
              Cancel
            </Button>
            <Button type="submit" size="md" className="w-[128px]" disabled={isSubmitting}>
              {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</> : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

