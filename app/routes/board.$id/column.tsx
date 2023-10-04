import {
  useState,
  type ReactNode,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import { useFetcher } from "@remix-run/react";

import { Icon } from "~/icons/icons";

import { INTENTS, type action } from "./data";

export function Column({
  children,
  name,
  columnId,
}: {
  children: ReactNode;
  name: string;
  columnId: number;
}) {
  let [edit, setEdit] = useState(false);
  let listRef = useRef<HTMLUListElement>(null);

  return (
    <div className="flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border rounded-xl shadow bg-stone-100">
      <ColumnHeader name={name} columnId={columnId} />

      <ul ref={listRef} className="flex-grow mt-1 overflow-auto">
        {children}

        {edit && (
          <NewCard columnId={columnId} onComplete={() => setEdit(false)} />
        )}
      </ul>

      {!edit && (
        <div className="p-1">
          <button
            type="button"
            onClick={() => {
              setEdit(true);
              requestAnimationFrame(() => {
                let scrollContainer = listRef.current;
                if (!scrollContainer) return;
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
              });
            }}
            className="flex items-center gap-2 rounded-lg text-left w-full p-2 font-medium text-stone-500 hover:bg-stone-200 focus:bg-stone-200"
          >
            <Icon name="plus" /> Add a card
          </button>
        </div>
      )}
    </div>
  );
}

function ColumnHeader({ name, columnId }: { name: string; columnId: number }) {
  let fetcher = useFetcher();
  let [edit, setEdit] = useState(false);
  let editNameRef = useRef<HTMLInputElement>(null);
  let editNameButtonRef = useRef<HTMLButtonElement>(null);

  // optimistic update
  if (fetcher.formData?.has("name")) {
    name = String(fetcher.formData.get("name"));
  }

  // manage focus
  useEffect(() => {
    if (document.activeElement !== document.body) {
      return;
    }
    if (edit) {
      editNameRef.current?.select();
    } else {
      editNameButtonRef.current?.focus();
    }
  }, [edit]);

  // reset edit state whenever the fetcher starts a new request
  useEffect(() => {
    if (fetcher.state !== "idle") {
      setEdit(false);
    }
  }, [fetcher]);

  return (
    <div className="p-2">
      {edit ? (
        <fetcher.Form
          method="post"
          onBlur={(event) => {
            fetcher.submit(event.currentTarget);
          }}
        >
          <input type="hidden" name="intent" value={INTENTS.updateColumn} />
          <input type="hidden" name="columnId" value={columnId} />
          <input
            ref={editNameRef}
            type="text"
            name="name"
            defaultValue={name}
            className="border border-stone-400 w-full rounded-lg py-1 px-2 font-medium text-black"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setEdit(false);
              }
            }}
          />
        </fetcher.Form>
      ) : (
        <button
          aria-label={`Edit column "${name}" name`}
          ref={editNameButtonRef}
          onClick={() => setEdit(true)}
          type="button"
          className="block rounded-lg text-left w-full border border-transparent py-1 px-2 font-medium text-stone-600"
        >
          {name || <span className="text-stone-400 italic">Add name</span>}
        </button>
      )}
    </div>
  );
}

function NewCard({
  columnId,
  onComplete,
}: {
  columnId: number;
  onComplete: () => void;
}) {
  let fetcher = useFetcher<typeof action>();
  let ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      onComplete();
    }
  }, [fetcher]);

  return (
    <fetcher.Form
      method="post"
      className="p-2 border-t-2 border-b-2 border-transparent -mb-[2px]"
      onBlur={onComplete}
    >
      <input type="hidden" name="intent" value={INTENTS.createItem} />
      <input type="hidden" name="columnId" value={columnId} />
      <textarea
        autoFocus
        ref={ref}
        name="title"
        placeholder="Enter a title for this card"
        className="outline-none shadow text-sm rounded-lg w-full py-1 px-2 resize-none placeholder:text-sm placeholder:text-stone-500 h-14"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            fetcher.submit(event.currentTarget.form);
          }
          if (event.key === "Escape") {
            onComplete();
          }
        }}
        onChange={(event) => {
          let el = event.currentTarget;
          el.style.height = el.scrollHeight + "px";
        }}
      />
      <div className="flex justify-between">
        <button
          type="submit"
          className="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue"
        >
          Save Card
        </button>
        <button
          type="button"
          onClick={() => setEdit(false)}
          className="text-sm rounded-lg text-left p-2 font-medium hover:bg-stone-200 focus:bg-stone-200"
        >
          Cancel
        </button>
      </div>
    </fetcher.Form>
  );
}
