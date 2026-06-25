"use client";

import { useState } from "react";
import Link from "next/link";
import {
  HeartIcon,
  MessageIcon,
  ShareIcon,
  EditIcon,
  CloseIcon,
} from "@/components/app/icons";

const myRecipes = [
  "Egg on Toast",
  "Egg on Toast",
  "Egg on Toast",
  "Egg on Toast",
  "Egg on Toast",
  "Egg on Toast",
];

const savedRecipes = ["Ravioli", "Pancakes", "Pizza"];

function RecipeCardEdit({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative size-[100px]">
        <Link
          href="/recipe/1"
          className="grid size-full place-items-center rounded-[5px] bg-[#e9ecf2] text-4xl"
        >
          🍳
        </Link>
        <div className="absolute inset-y-[3px] right-[3px] flex flex-col justify-between">
          <button
            type="button"
            aria-label={`Edit ${name}`}
            className="grid size-9 place-items-center rounded-[6px] bg-[#f79863] text-white shadow"
          >
            <EditIcon className="size-5" />
          </button>
          <button
            type="button"
            aria-label={`Delete ${name}`}
            className="grid size-9 place-items-center rounded-[6px] bg-brand text-white shadow"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
      </div>
      <p className="mt-1 max-w-[100px] truncate text-sm text-[#292929]">{name}</p>
    </div>
  );
}

export default function UserScreen() {
  const [tab, setTab] = useState<"mine" | "saved">("mine");
  const recipes = tab === "mine" ? myRecipes : savedRecipes;

  return (
    <div className="flex min-h-full flex-col items-center bg-[#f6f7fa] py-2.5">
      {/* User details */}
      <div className="flex w-[340px] flex-col gap-2.5 py-2.5">
        <div className="flex gap-5 py-2.5">
          <div className="flex w-[55px] flex-col items-center gap-5">
            <span className="grid size-[55px] place-items-center rounded-full bg-brand/15 text-lg font-bold text-brand">
              CH
            </span>
            <div className="flex flex-1 flex-col items-center justify-between gap-3 text-brand">
              <button type="button" aria-label="Like">
                <HeartIcon className="size-7" />
              </button>
              <button type="button" aria-label="Message">
                <MessageIcon className="size-7" />
              </button>
              <button type="button" aria-label="Share">
                <ShareIcon className="size-6" />
              </button>
            </div>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            <p className="text-xl font-bold text-brand">Courtney Henry</p>
            <p className="text-base italic text-[#292929]">
              I&rsquo;m passionate about cooking and love experimenting with
              flavours and ingredients. I create simple, delicious recipes with
              easy-to-follow instructions, inspiring others to try new dishes in
              their kitchens.
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 text-xl text-muted">
          <Link href="/user/followers" className="font-bold hover:text-brand">
            3 Followers
          </Link>
          <span>|</span>
          <Link href="/user/following" className="font-bold hover:text-brand">
            10 Following
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full shadow-sm">
        {(["mine", "saved"] as const).map((t) => {
          const active = tab === t;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`flex-1 bg-white py-4 text-center text-base font-bold ${
                active
                  ? "text-[#1a1a1a] shadow-[inset_0_-2px_0_0_#f76365]"
                  : "text-[#666]"
              }`}
            >
              {t === "mine" ? "MY RECIPES" : "SAVED RECIPES"}
            </button>
          );
        })}
      </div>

      {/* Recipe grid */}
      <div className="flex w-full flex-wrap justify-between gap-y-[15px] bg-white p-2.5">
        {recipes.map((name, i) => (
          <RecipeCardEdit key={`${name}-${i}`} name={name} />
        ))}
      </div>
    </div>
  );
}
