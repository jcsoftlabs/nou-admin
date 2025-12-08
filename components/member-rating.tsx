"use client";

import { useState } from "react";
import { Star, Plus } from "lucide-react";
import { adminService } from "@/lib/api";
import { Button } from "@/components/ui/button";
import type { Membre } from "@/types/backend";

interface MemberRatingProps {
  membre: Membre;
  token: string;
  onUpdated?: (newRating: number) => void;
}

export function MemberRating({ membre, token, onUpdated }: MemberRatingProps) {
  const [rating, setRating] = useState<number>(membre.rating ?? 0);
  const [loading, setLoading] = useState(false);
  const canIncrease = rating < 5;

  const handleIncrease = async () => {
    if (!canIncrease || loading) return;
    try {
      setLoading(true);
      const next = Math.min(5, rating + 1);
      const res = await adminService.updateMembreRating(membre.id, next, token);
      if (res.success && res.data) {
        setRating(res.data.rating);
        onUpdated?.(res.data.rating);
      } else {
        console.error(res.message || "Échec de mise à jour de la note");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className="h-4 w-4"
            fill={i < rating ? "#f59e0b" : "none"}
            color={i < rating ? "#f59e0b" : "#9ca3af"}
          />
        ))}
      </div>
      <Button size="sm" variant="outline" disabled={!canIncrease || loading} onClick={handleIncrease}>
        <Plus className="h-4 w-4 mr-1" />
        +1
      </Button>
    </div>
  );
}