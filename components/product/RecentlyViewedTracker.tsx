"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore, type ViewedLine } from "@/store/recently-viewed";

export function RecentlyViewedTracker({ product }: { product: ViewedLine }) {
  const add = useRecentlyViewedStore((s) => s.add);
  useEffect(() => {
    add(product);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.productId]);
  return null;
}
