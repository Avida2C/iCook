"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import AvatarPicker from "@/components/AvatarPicker";
import { useAuth, isDemoAccount } from "@/components/auth/AuthProvider";
import { CURRENT_USER } from "@/components/app/user/data";
import { initialsFromName } from "@/lib/username";

export default function SettingsUserScreen() {
  const { user, updateProfile } = useAuth();
  const isDemo = isDemoAccount(user?.email);

  const profile = user ?? {
    email: `${CURRENT_USER.handle}@email.com`,
    username: CURRENT_USER.handle,
    firstName: CURRENT_USER.name.split(" ")[0] ?? "",
    lastName: CURRENT_USER.name.split(" ").slice(1).join(" "),
    name: CURRENT_USER.name,
    avatarUrl: undefined as string | undefined,
    about:
      "I'm passionate about cooking and love experimenting with flavours and ingredients. I create simple, delicious recipes with easy-to-follow instructions.",
  };

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [about, setAbout] = useState(profile.about ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(
    profile.avatarUrl ?? null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.firstName);
    setLastName(user.lastName);
    setAbout(user.about ?? "");
    setAvatarUrl(user.avatarUrl ?? null);
  }, [user]);

  const initials = useMemo(
    () => initialsFromName(firstName, lastName),
    [firstName, lastName],
  );

  function handleProfileSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);
    const result = updateProfile({
      firstName,
      lastName,
      about,
      avatarUrl,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage("Profile updated.");
  }

  return (
    <div className="page">
      <div className="surface-block shrink-0">
        <div className="flex flex-col items-center gap-4 px-2 pb-2 pt-8">
          <AvatarPicker
            variant="profile"
            initials={initials}
            handle={profile.username}
            value={avatarUrl}
            onChange={(url) => {
              setAvatarUrl(url);
              setError(null);
            }}
            onError={(msg) => setError(msg || null)}
            actionHint="Tap photo to change"
          />
          <div className="flex flex-col items-center">
            <p className="text-xl leading-6 text-brand">
              {[firstName, lastName].filter(Boolean).join(" ") || profile.name}
            </p>
            <p className="flex items-center justify-center gap-0 py-1 pr-3 text-xs leading-3.5">
              <span className="text-brand-soft">@</span>
              <span className="text-muted">{profile.username}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="list-stack py-2">
        <form
          className="feed-card flex flex-col gap-2.5"
          onSubmit={handleProfileSubmit}
        >
          <h2 className="section-title">Username</h2>
          <div className="field-sm flex items-center gap-0.5 bg-app/60 text-muted">
            <span className="shrink-0 text-brand-soft" aria-hidden>
              @
            </span>
            <input
              id="username"
              name="username"
              type="text"
              value={profile.username}
              readOnly
              disabled
              aria-label="Username (cannot be changed)"
              className="min-w-0 flex-1 cursor-not-allowed border-0 bg-transparent py-0.5 text-base outline-none"
            />
          </div>
          <p className="text-xs italic text-muted">
            Usernames can’t be changed after signup.
          </p>

          <h2 className="section-title">Full name</h2>
          <div className="flex gap-2.5">
            <input
              id="firstName"
              name="firstName"
              className="field-sm"
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              aria-label="First name"
              required
            />
            <input
              id="lastName"
              name="lastName"
              className="field-sm"
              placeholder="Last name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              aria-label="Last name"
              required
            />
          </div>

          <label className="section-title" htmlFor="about">
            About me
          </label>
          <textarea
            id="about"
            name="about"
            rows={5}
            maxLength={500}
            className="field-sm resize-none"
            placeholder="Tell us about yourself"
            value={about}
            onChange={(e) => setAbout(e.target.value.slice(0, 500))}
            aria-describedby="about-count"
          />
          <p
            id="about-count"
            className="text-xs text-muted"
          >{`${about.length}/500`}</p>
          {error ? (
            <p role="alert" className="text-sm font-bold text-brand">
              {error}
            </p>
          ) : null}
          {message ? (
            <p role="status" className="text-sm font-bold text-ink-secondary">
              {message}
            </p>
          ) : null}
          <button type="submit" className="btn-primary w-full">
            Update profile
          </button>
        </form>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="text-xs font-bold text-brand-soft">Account security</h2>
          <p className="py-1 text-sm text-muted">
            Email: <span className="font-bold text-ink">{profile.email}</span>
          </p>
          <Link
            href="/change-email"
            className="py-2 text-base font-bold text-brand"
          >
            Change Email
          </Link>
          <Link
            href="/change-password"
            className="py-2 text-base font-bold text-brand"
          >
            Change Password
          </Link>
        </section>

        <section className="feed-card flex flex-col gap-1">
          <h2 className="text-xs font-bold text-brand-soft">Account</h2>
          {isDemo ? (
            <p className="py-2 text-sm text-muted">
              Reset and delete aren&rsquo;t available for the demo account.
              Create your own account to manage these options.
            </p>
          ) : (
            <>
              <p className="py-1 text-sm text-muted">
                Reset clears activity, recipes, saved items, followers,
                following, pantry, and posts, but keeps your login. Delete
                schedules permanent removal after 30 days.
              </p>
              <Link
                href="/reset-account"
                className="py-2 text-base font-bold text-brand"
              >
                Reset account
              </Link>
              <Link
                href="/delete-account"
                className="py-2 text-base font-bold text-brand"
              >
                Delete account
              </Link>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
