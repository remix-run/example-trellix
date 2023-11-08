import { useFetcher } from "@remix-run/react";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

export let SaveButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue"
    />
  );
});

export let CancelButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>((props, ref) => {
  return (
    <button
      ref={ref}
      {...props}
      className="text-sm rounded-lg text-left p-2 font-medium hover:bg-slate-200 focus:bg-slate-200"
    />
  );
});

export function EditableText({
  children,
  fieldName,
  value,
  inputClassName,
  inputLabel,
  buttonClassName,
  buttonLabel,
}: {
  children: React.ReactNode;
  fieldName: string;
  value: string;
  inputClassName: string;
  inputLabel: string;
  buttonClassName: string;
  buttonLabel: string;
}) {
  let fetcher = useFetcher();
  let [edit, setEdit] = useState(false);
  let inputRef = useRef<HTMLInputElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);
  let mounted = useRef(false);

  // optimistic update
  if (fetcher.formData?.has(fieldName)) {
    value = String(fetcher.formData.get("name"));
  }

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  // manage focus
  useLayoutEffect(() => {
    if (!mounted.current) return;
    if (edit) {
      console.log("focus input");
      inputRef.current?.select();
    } else {
      console.log("focus button");
      buttonRef.current?.focus();
    }
  }, [edit]);

  // reset edit state whenever the fetcher starts a new request
  useLayoutEffect(() => {
    if (fetcher.state !== "idle") {
      setEdit(false);
    }
  }, [fetcher]);

  return edit ? (
    <fetcher.Form
      method="post"
      onBlur={(event) => {
        if (inputRef.current?.value === value) {
          setEdit(false);
        } else {
          fetcher.submit(event.currentTarget);
        }
      }}
    >
      {children}
      <input
        ref={inputRef}
        type="text"
        aria-label={inputLabel}
        name={fieldName}
        defaultValue={value}
        className={inputClassName}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setEdit(false);
          }
        }}
      />
    </fetcher.Form>
  ) : (
    <button
      aria-label={buttonLabel}
      ref={buttonRef}
      onClick={() => setEdit(true)}
      type="button"
      className={buttonClassName}
    >
      {value || <span className="text-slate-400 italic">Edit</span>}
    </button>
  );
}
