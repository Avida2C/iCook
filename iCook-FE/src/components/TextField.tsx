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
        className="w-full rounded-[4px] border border-[#d0d6e8] bg-[#f6f7fa] px-3 py-2.5 text-base text-[#292929] outline-none placeholder:text-muted focus:border-brand"
      />
    </div>
  );
}
