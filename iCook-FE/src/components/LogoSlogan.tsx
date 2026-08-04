import Logo from "@/components/Logo";

export default function LogoSlogan() {
  return (
    <header className="flex w-full flex-col gap-1 pt-5">
      <Logo className="text-5xl" />
      <p className="text-base text-brand mb-3">Your Kitchen, Your Creativity.</p>
    </header>
  );
}
