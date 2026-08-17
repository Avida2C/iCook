import type { Metadata } from "next";
import WeekPlanScreen from "@/components/plan/WeekPlanScreen";

export const metadata: Metadata = {
  title: "Week plan · iCook",
};

export default function PlanPage() {
  return <WeekPlanScreen />;
}
