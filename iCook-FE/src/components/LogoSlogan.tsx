import Logo from "@/components/Logo";

export default function LogoSlogan() {
  return (
    <header className="flex w-full flex-col gap-1 py-5">
      <Logo className="text-5xl" />
      <p className="text-base text-brand">Your Kitchen, Your Creativity.</p>
    </header>
  );
}
