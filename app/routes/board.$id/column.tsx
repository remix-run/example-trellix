import { useState, type ReactNode, useEffect, useRef, Children } from "react";
import { useFetcher, useFetchers, useSubmit } from "@remix-run/react";

import { Icon } from "../../icons/icons";

import { INTENTS } from "./INTENTS";
import invariant from "tiny-invariant";
import { NewCard } from "./new-card";
import { flushSync } from "react-dom";
import { CONTENT_TYPES } from "./CONTENT_TYPES";
import { Card } from "./card";

interface Item {
  id: number;
  title: string;
  order: number;
  content: string | null;
}

interface ColumnProps {
  name: string;
  columnId: number;
  items: Item[];
}

export function Column({ name, columnId, items }: ColumnProps) {
  let submit = useSubmit();

  let [acceptDrop, setAcceptDrop] = useState(false);
  let [edit, setEdit] = useState(false);
  let listRef = useRef<HTMLUListElement>(null);
  let addingItems = useAddingCards(columnId);

  function scrollList() {
    invariant(listRef.current);
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }

  let isEmpty = items.length === 0;

  return (
    <div
      className={
        "flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border rounded-xl shadow bg-stone-100 " +
        (acceptDrop ? `outline outline-2 outline-brand-red` : ``)
      }
      onDragOver={(event) => {
        if (isEmpty && event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
          event.preventDefault();
          setAcceptDrop(true);
        }
      }}
      onDragLeave={() => {
        setAcceptDrop(false);
      }}
      onDrop={(event) => {
        let cardId = Number(event.dataTransfer.getData(CONTENT_TYPES.card));
        invariant(typeof cardId === "number", "missing cardId");

        let data = {
          intent: INTENTS.moveItem,
          order: 1,
          cardId: cardId,
          columnId: columnId,
        };
        submit(data, {
          method: "post",
          navigate: false,
          fetcherKey: `${INTENTS.moveItem}:${cardId}`,
          encType: "application/json",
        });

        setAcceptDrop(false);
      }}
    >
      <ColumnHeader name={name} columnId={columnId} />

      <ul ref={listRef} className="flex-grow overflow-auto">
        {items
          .concat(addingItems)
          .sort((a, b) => a.order - b.order)
          .map((item, index, items) => (
            <Card
              key={item.id}
              title={item.title}
              content={item.content}
              id={item.id}
              order={item.order}
              columnId={columnId}
              previousOrder={items[index - 1] ? items[index - 1].order : 0}
              nextOrder={items[index + 1] ? items[index + 1].order : item.order + 1}
            />
          ))}

        {edit && (
          <NewCard
            columnId={columnId}
            nextOrder={items.length + addingItems.length}
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

interface ColumnHeaderProps {
  name: string;
  columnId: number;
}

function ColumnHeader({ name, columnId }: ColumnHeaderProps) {
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
            if (editNameRef.current?.value === "") {
              setEdit(false);
            } else {
              fetcher.submit(event.currentTarget);
            }
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

function useAddingCards(columnId: number) {
  type CreateCardFetcher = ReturnType<typeof useFetchers>[0] & { formData: FormData };

  return useFetchers()
    .filter((fetcher): fetcher is CreateCardFetcher => {
      return fetcher.formData?.get("intent") === INTENTS.createItem;
    })
    .filter((fetcher) => {
      return fetcher.formData?.get("columnId") === String(columnId);
    })
    .map((fetcher) => {
      let title = String(fetcher.formData.get("title"));
      let TODO_useClientIds = Number(fetcher.formData.get("clientId"));
      let order = Number(fetcher.formData.get("order"));
      let item: Item = { title, id: TODO_useClientIds, order, content: null };
      return item;
    });
}
