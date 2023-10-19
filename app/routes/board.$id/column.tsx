import {
  useState,
  type ReactNode,
  useEffect,
  useRef,
  useContext,
  Children,
} from "react";
import { UNSAFE_DataRouterContext } from "react-router-dom";
import { useFetcher } from "@remix-run/react";

import { Icon } from "~/icons/icons";

import { INTENTS } from "./controller";
import invariant from "tiny-invariant";
import { NewCard } from "./new-card";
import { flushSync } from "react-dom";
import { CONTENT_TYPES } from "./content-types";

type ColumnProps =
  | {
      disabled?: undefined;
      children: ReactNode;
      name: string;
      columnId: number;
    }
  | {
      disabled: true;
      children?: undefined;
      name: string;
      columnId?: undefined;
    };

export function Column({
  children,
  name,
  columnId,
  disabled,
}: ColumnProps) {
  let ctxt = useContext(UNSAFE_DataRouterContext);
  invariant(ctxt);
  let { router } = ctxt;

  let [acceptDrop, setAcceptDrop] = useState(false);
  let [edit, setEdit] = useState(false);
  let listRef = useRef<HTMLUListElement>(null);

  function scrollList() {
    invariant(listRef.current);
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  let isEmpty = Children.count(children) === 0;

  return (
    <div
      className={
        `flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border rounded-xl shadow bg-stone-100 ` +
        (acceptDrop ? `outline outline-2 outline-brand-red` : ``)
      }
      onDragOver={(event) => {
        if (disabled) return;
        if (
          isEmpty &&
          event.dataTransfer.types.includes(CONTENT_TYPES.card)
        ) {
          event.preventDefault();
          setAcceptDrop(true);
        }
      }}
      onDragLeave={() => {
        setAcceptDrop(false);
      }}
      onDrop={(event) => {
        if (disabled) return;
        console.log("Column DROP");

        let { cardId, columnId: oldColumnId } = JSON.parse(
          event.dataTransfer.getData(CONTENT_TYPES.card),
        );
        invariant(typeof cardId === "number", "missing cardId");
        invariant(typeof oldColumnId === "number", "missing columnId");

        let formData = new FormData();
        formData.set("intent", INTENTS.moveItem);
        formData.set("order", "1");
        formData.set("cardId", String(cardId));
        formData.set("newColumnId", String(columnId));
        formData.set("oldColumnId", String(oldColumnId));

        let fetcherKey = `${INTENTS.moveItem}:${cardId}`;
        router.fetch(
          fetcherKey,
          "routes/board.$id",
          location.pathname,
          { formMethod: "post", formData, persist: true },
        );

        setAcceptDrop(false);
      }}
    >
      {disabled ? (
        <ColumnHeader disabled name={name} />
      ) : (
        <ColumnHeader name={name} columnId={columnId} />
      )}

      <ul ref={listRef} className="flex-grow overflow-auto">
        {children}

        {!disabled && edit && (
          <NewCard
            columnId={columnId}
            onAddCard={() => scrollList()}
            onComplete={() => setEdit(false)}
          />
        )}
      </ul>

      {!edit && (
        <div className="p-2">
          <button
            type="button"
            onClick={() => {
              flushSync(() => {
                setEdit(true);
              });
              scrollList();
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

type ColumnHeaderProps =
  | {
      disabled?: undefined;
      name: string;
      columnId: number;
    }
  | {
      disabled: true;
      name: string;
      columnId?: undefined;
    };

function ColumnHeader({ name, columnId, disabled }: ColumnHeaderProps) {
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
      {!disabled && edit ? (
        <fetcher.Form
          method="post"
          onBlur={(event) => {
            if (editNameRef.current?.value === "") {
              setEdit(false);
            } else {
              fetcher.submit(event.currentTarget);
            }
          }}
        >
          <input
            type="hidden"
            name="intent"
            value={INTENTS.updateColumn}
          />
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
          disabled={disabled}
          onClick={() => setEdit(true)}
          type="button"
          className="block rounded-lg text-left w-full border border-transparent py-1 px-2 font-medium text-stone-600"
        >
          {name || (
            <span className="text-stone-400 italic">Add name</span>
          )}
        </button>
      )}
    </div>
  );
}
