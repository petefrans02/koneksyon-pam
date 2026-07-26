"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function EglisePage() {
  const router = useRouter();
  useEffect(() => { router.replace("/communaute"); }, [router]);
  return null;
}
