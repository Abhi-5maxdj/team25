import type { ReactNode } from "react"

import { Card, CardContent } from "@/components/ui/card"

interface TrafficAlertProps {
  location: string
  condition: string
  impact: "Low" | "Medium" | "High"
  icon: ReactNode
  description: string
}

export function TrafficAlert({ location, condition, impact, icon, description }: TrafficAlertProps) {
  const impactColors = {
    Low: "bg-blue-100 text-blue-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">{icon}</div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{location}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${impactColors[impact]}`}>
                {impact} Impact
              </span>
            </div>
            <p className="text-sm font-medium">{condition}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

