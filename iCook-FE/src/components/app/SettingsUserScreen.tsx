"use client";

import { UploadIcon } from "@/components/app/icons";

const inputClass =
  "w-full rounded-[4px] border border-line bg-app px-2 py-1.5 text-base text-ink outline-none placeholder:italic placeholder:text-muted focus:border-brand";
const labelClass = "text-base font-bold text-black";
const buttonClass =
  "w-full rounded-[5px] bg-brand px-5 py-1.5 text-xl font-bold text-white shadow-md transition-colors hover:bg-[#e85557]";

export default function SettingsUserScreen() {
  return (
    <div className="flex min-h-full flex-col bg-app">
      <div className="flex flex-col gap-[5px]">
        {/* Avatar upload */}
        <div className="flex flex-col items-center gap-2.5 bg-surface py-5">
          <button
            type="button"
            className="relative grid size-[143px] place-items-center rounded-full border-2 border-dashed border-line"
            aria-label="Change profile picture"
          >
            <span className="grid size-[130px] place-items-center rounded-full bg-brand/15 text-3xl font-bold text-brand">
              CH
            </span>
            <span className="absolute bottom-1 right-1 grid size-10 place-items-center rounded-full bg-brand text-white">
              <UploadIcon className="size-5" />
            </span>
          </button>
          <div className="text-center">
            <p className="text-base font-bold text-brand">
              Click to Change Profile Picture
            </p>
            <p className="text-base italic text-muted">
              Supports JPG, PNG, up to 5MB
            </p>
          </div>
        </div>

        {/* Full name */}
        <form
          className="flex flex-col gap-2.5 bg-surface p-2.5"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className={labelClass} htmlFor="firstName">Full Name</label>
          <div className="flex justify-between gap-2.5">
            <input id="firstName" name="firstName" className={inputClass} placeholder="Courtney" defaultValue="Courtney" />
            <input name="lastName" className={inputClass} placeholder="Henry" defaultValue="Henry" aria-label="Last name" />
          </div>
        </form>

        {/* About me */}
        <form
          className="flex flex-col gap-2.5 bg-surface p-2.5"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className={labelClass} htmlFor="about">About Me</label>
          <textarea
            id="about"
            name="about"
            rows={5}
            className={`${inputClass} resize-none`}
            placeholder="Tell us about yourself"
            defaultValue="I'm passionate about cooking and love experimenting with flavours and ingredients. I create simple, delicious recipes with easy-to-follow instructions."
          />
          <button type="submit" className={buttonClass}>
            Update User Details
          </button>
        </form>

        {/* Email */}
        <form
          className="flex flex-col gap-2.5 bg-surface p-2.5"
          onSubmit={(e) => e.preventDefault()}
        >
          <label className={labelClass} htmlFor="email">Email Address</label>
          <input id="email" name="email" type="email" className={inputClass} placeholder="example@example.com" />
          <label className={labelClass} htmlFor="confirmEmail">Confirm Email Address</label>
          <input id="confirmEmail" name="confirmEmail" type="email" className={inputClass} placeholder="Confirm email address" />
          <button type="submit" className={buttonClass}>
            Update Email Address
          </button>
        </form>
      </div>
    </div>
  );
}
