"use client"

import type React from "react"

import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

interface InventoryFormProps {
  onSubmit: (items: any[], requirements: any) => void
}

export function InventoryForm({ onSubmit }: InventoryFormProps) {
  const [items, setItems] = useState([{ name: "", quantity: "", type: "" }])
  const [requirements, setRequirements] = useState({
    temperatureControl: false,
    fragileHandling: false,
    expressDelivery: false,
  })

  const addItem = () => {
    setItems([...items, { name: "", quantity: "", type: "" }])
  }

  const updateItem = (index: number, field: string, value: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleRequirementChange = (requirement: string) => {
    setRequirements({
      ...requirements,
      [requirement]: !requirements[requirement],
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(items, requirements)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Inventory Items</h3>
        {items.map((item, index) => (
          <div key={index} className="space-y-4 rounded-md border p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor={`item-name-${index}`}>Item Name</Label>
                <Input
                  id={`item-name-${index}`}
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`item-quantity-${index}`}>Quantity</Label>
                <Input
                  id={`item-quantity-${index}`}
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  placeholder="Enter quantity"
                  type="number"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={`item-type-${index}`}>Item Type</Label>
              <Select value={item.type} onValueChange={(value) => updateItem(index, "type", value)} required>
                <SelectTrigger id={`item-type-${index}`}>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="perishable">Perishable</SelectItem>
                  <SelectItem value="fragile">Fragile</SelectItem>
                  <SelectItem value="hazardous">Hazardous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addItem}>
          Add Another Item
        </Button>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Special Requirements</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="temperature-control">Temperature Control</Label>
              <p className="text-sm text-muted-foreground">Required for perishable items</p>
            </div>
            <Switch
              id="temperature-control"
              checked={requirements.temperatureControl}
              onCheckedChange={() => handleRequirementChange("temperatureControl")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="fragile-handling">Fragile Handling</Label>
              <p className="text-sm text-muted-foreground">Special care for fragile items</p>
            </div>
            <Switch
              id="fragile-handling"
              checked={requirements.fragileHandling}
              onCheckedChange={() => handleRequirementChange("fragileHandling")}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="express-delivery">Express Delivery</Label>
              <p className="text-sm text-muted-foreground">Priority handling and faster transit</p>
            </div>
            <Switch
              id="express-delivery"
              checked={requirements.expressDelivery}
              onCheckedChange={() => handleRequirementChange("expressDelivery")}
            />
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Additional Notes</h3>
        <div className="space-y-2">
          <Label htmlFor="notes">Special Instructions</Label>
          <textarea
            id="notes"
            className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Enter any special instructions or notes for this shipment"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">Continue to Results</Button>
      </div>
    </form>
  )
}

