type SwitchProps = {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
};

/** Brand toggle used across Security, Notifications, and filters. */
export default function Switch({
  checked,
  onChange,
  label,
  disabled,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-40 ${
        checked ? "bg-brand" : "bg-line"
      }`}
    >
      <span
        className={`absolute top-0.5 size-5 rounded-full bg-white shadow transition-all ${
          checked ? "left-5.5" : "left-0.5"
        }`}
      />
    </button>
  );
}
