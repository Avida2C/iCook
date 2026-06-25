import { GoogleIcon, FacebookIcon } from "@/components/app/icons";

/** "Sign up with / Log In with" divider plus Google & Facebook buttons. */
export default function SocialLogin({ label }: { label: string }) {
  return (
    <div className="flex w-full flex-col items-center gap-2.5">
      <div className="flex w-full items-center gap-3 px-2.5">
        <span className="h-px flex-1 bg-[#d0d6e8]" />
        <span className="shrink-0 text-base text-muted">{label}</span>
        <span className="h-px flex-1 bg-[#d0d6e8]" />
      </div>
      <div className="flex w-full items-center justify-between px-12 py-1">
        <button
          type="button"
          aria-label="Continue with Google"
          className="transition-transform hover:scale-105"
        >
          <GoogleIcon className="size-16" />
        </button>
        <button
          type="button"
          aria-label="Continue with Facebook"
          className="transition-transform hover:scale-105"
        >
          <FacebookIcon className="size-16 text-[#1877F2]" />
        </button>
      </div>
    </div>
  );
}
