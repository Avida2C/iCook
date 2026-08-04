type TextFieldProps = {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
};

export default function TextField({
  label,
  name,
  type = "text",
  placeholder,
  autoComplete,
  required,
}: TextFieldProps) {
  return (
    <div className="flex w-full flex-col gap-2.5">
      <label htmlFor={name} className="text-base font-bold text-muted">
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
      />
    </div>
  );
}
