type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  value?: string;
  onChange?: (value: string) => void;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
  value,
  onChange,
}: TextFieldProps) {
  const controlled =
    value !== undefined
      ? {
          value,
          onChange: (e: { target: { value: string } }) =>
            onChange?.(e.target.value),
        }
      : {};

  return (
    <div className="flex w-full flex-col gap-1">
      <label htmlFor={name} className="text-base font-semibold text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="field"
        {...controlled}
      />
    </div>
  );
}
