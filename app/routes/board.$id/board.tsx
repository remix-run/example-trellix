import { useRef } from "react";
import invariant from "tiny-invariant";
import { useFetchers, useLoaderData } from "@remix-run/react";

import { type loader } from "./route";
import { INTENTS, type RenderedItem } from "./types";
import { Column } from "./column";
import { NewColumn } from "./new-column";
import { EditableText } from "./components";

export function Board() {
  let { board } = useLoaderData<typeof loader>();

  let itemsById = new Map(board.items.map((item) => [item.id, item]));

  let pendingItems = usePendingItems();

  // merge pending items and existing items
  for (let pendingItem of pendingItems) {
    let item = itemsById.get(pendingItem.id);
    let merged = item
      ? { ...item, ...pendingItem }
      : { ...pendingItem, boardId: board.id };
    itemsById.set(pendingItem.id, merged);
  }

  // merge pending and existing columns
  let optAddingColumns = usePendingColumns();
  type Column =
    | (typeof board.columns)[number]
    | (typeof optAddingColumns)[number];
  type ColumnWithItems = Column & { items: typeof board.items };
  let columns = new Map<string, ColumnWithItems>();
  for (let column of [...board.columns, ...optAddingColumns]) {
    columns.set(column.id, { ...column, items: [] });
  }

  // add items to their columns
  for (let item of itemsById.values()) {
    let columnId = item.columnId;
    let column = columns.get(columnId);
    invariant(column, "missing column");
    column.items.push(item);
  }

  // scroll right when new columns are added
  let scrollContainerRef = useRef<HTMLDivElement>(null);
  function scrollRight() {
    invariant(scrollContainerRef.current, "no scroll container");
    scrollContainerRef.current.scrollLeft =
      scrollContainerRef.current.scrollWidth;
  }

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-x-scroll"
      ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <h1>
        <EditableText
          value={board.name}
          fieldName="name"
          inputClassName="mx-8 my-4 text-2xl font-medium border border-slate-400 rounded-lg py-1 px-2 text-black"
          buttonClassName="mx-8 my-4 text-2xl font-medium block rounded-lg text-left border border-transparent py-1 px-2 text-slate-800"
          buttonLabel={`Edit board "${board.name}" name`}
          inputLabel="Edit board name"
        >
          <input type="hidden" name="intent" value={INTENTS.updateBoardName} />
          <input type="hidden" name="id" value={board.id} />
        </EditableText>
      </h1>

      <div className="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
        {[...columns.values()].map((col) => {
          return (
            <Column
              key={col.id}
              name={col.name}
              columnId={col.id}
              items={col.items}
            />
          );
        })}

        <NewColumn
          boardId={board.id}
          onAdd={scrollRight}
          editInitially={board.columns.length === 0}
        />

        {/* trolling you to add some extra margin to the right of the container with a whole dang div */}
        <div data-lol className="w-8 h-1 flex-shrink-0" />
      </div>
    </div>
  );
}

// These are the inflight columns that are being created, instead of managing
// state ourselves, we just ask Remix for the state
function usePendingColumns() {
  type CreateColumnFetcher = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };

  return useFetchers()
    .filter((fetcher): fetcher is CreateColumnFetcher => {
      return fetcher.formData?.get("intent") === INTENTS.createColumn;
    })
    .map((fetcher) => {
      let name = String(fetcher.formData.get("name"));
      let id = String(fetcher.formData.get("id"));
      return { name, id };
    });
}

// These are the inflight items that are being created or moved, instead of
// managing state ourselves, we just ask Remix for the state
function usePendingItems() {
  type PendingItem = ReturnType<typeof useFetchers>[number] & {
    formData: FormData;
  };
  return useFetchers()
    .filter((fetcher): fetcher is PendingItem => {
      if (!fetcher.formData) return false;
      let intent = fetcher.formData.get("intent");
      return intent === INTENTS.createItem || intent === INTENTS.moveItem;
    })
    .map((fetcher) => {
      let columnId = String(fetcher.formData.get("columnId"));
      let title = String(fetcher.formData.get("title"));
      let id = String(fetcher.formData.get("id"));
      let order = Number(fetcher.formData.get("order"));
      let item: RenderedItem = { title, id, order, columnId, content: null };
      return item;
    });
}
