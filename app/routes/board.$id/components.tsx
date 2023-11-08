import { useFetcher } from "@remix-run/react";
import {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
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
  let mounted = useRef(false);
  let fetcher = useFetcher();
  let [editing, setEditing] = useState(false);
  let [stoppingEdit, stopEditing] = useTransition();
  let [startingEdit, startEditing] = useTransition();
  let inputRef = useRef<HTMLInputElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);

  // optimistic update
  if (fetcher.formData?.has(fieldName)) {
    value = String(fetcher.formData.get("name"));
  }

  function stopEdit() {
    stopEditing(() => {
      setEditing(false);
    });
  }

  function startEdit() {
    startEditing(() => {
      setEditing(true);
    });
  }

  useEffect(() => {
    console.log("mount effect");
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useLayoutEffect(() => {
    console.log("stop effect", { stoppingEdit, editing });
    if (!mounted.current) return;
    if (!stoppingEdit && !editing) {
      console.log("focus button");
      buttonRef.current?.focus();
    }
  }, [stoppingEdit, editing]);

  useLayoutEffect(() => {
    console.log("start effect", { startingEdit, editing });
    if (!mounted.current) return;
    if (!startingEdit && editing) {
      console.log("focus input");
      inputRef.current?.focus();
    }
  }, [startingEdit, editing]);

  // reset edit state whenever the fetcher starts a new request
  useEffect(() => {
    if (fetcher.state !== "idle") {
      stopEdit();
    }
  }, [fetcher]);

  return editing ? (
    <fetcher.Form
      method="post"
      onSubmit={(event) => {
        if (inputRef.current?.value === value) {
          event.preventDefault();
          stopEdit();
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
            stopEdit();
          }
        }}
        onBlur={(event) => {
          console.log("blur", value);
          if (inputRef.current?.value === value) {
            stopEdit();
          } else {
            fetcher.submit(event.currentTarget.form);
          }
        }}
      />
    </fetcher.Form>
  ) : (
    <button
      aria-label={buttonLabel}
      ref={buttonRef}
      onClick={() => startEdit()}
      type="button"
      className={buttonClassName}
    >
      {value || <span className="text-slate-400 italic">Edit</span>}
    </button>
  );
}
