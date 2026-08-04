import type { Metadata } from "next";
import MoreRecipesScreen from "@/components/app/MoreRecipesScreen";

export const metadata: Metadata = {
  title: "More Recipes · iCook",
};

type MoreRecipesPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    sort?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MoreRecipesPage({
  searchParams,
}: MoreRecipesPageProps) {
  const params = await searchParams;

  return (
    <MoreRecipesScreen
      category={firstParam(params.category)}
      sort={firstParam(params.sort)}
    />
  );
}
