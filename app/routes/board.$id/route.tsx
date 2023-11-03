import { Link, useFetchers, useLoaderData } from "@remix-run/react";
import { action } from "./server";
import { loader } from "./server";
import { INTENTS } from "./mutations";
import { Column } from "./column";
import { NewColumn } from "./new-column";
import { useRef } from "react";
import invariant from "tiny-invariant";
import { RenderedItem } from "./types";
import { MetaFunction } from "@remix-run/node";

export { loader, action };

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];
  return [{ title: `${data.board.name} | Trellix` }];
};

export default function Board() {
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
  let optAddingColumns = useAddingColumns();
  type Column = (typeof board.columns)[0] | (typeof optAddingColumns)[0];
  type ColumnWithItems = Column & { items: typeof board.items };
  let columns = [...board.columns, ...optAddingColumns].reduce(
    (map, column) => map.set(String(column.id), { ...column, items: [] }),
    new Map<string, ColumnWithItems>(),
  );

  // add items to their columns
  for (let item of itemsById.values()) {
    let columnId = item.columnId;
    let column = columns.get(columnId);
    invariant(column, "missing column");
    column.items.push(item);
  }

  let scrollContainerRef = useRef<HTMLDivElement>(null);
  function scrollRight() {
    invariant(scrollContainerRef.current);
    scrollContainerRef.current.scrollLeft =
      scrollContainerRef.current.scrollWidth;
  }

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-x-scroll"
      ref={scrollContainerRef}
      style={{ backgroundColor: board.color }}
    >
      <h1 className="px-8 my-4 text-2xl font-medium">{board.name}</h1>

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

        <div data-lol-shutup className="w-8 h-1 flex-shrink-0" />
      </div>
    </div>
  );
}

function useAddingColumns() {
  type CreateColumnFetcher = ReturnType<typeof useFetchers>[0] & {
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

function usePendingItems() {
  type PendingItem = ReturnType<typeof useFetchers>[0] & {
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

export function ErrorBoundary() {
  return (
    <div>
      <h1>Dang ... had an error.</h1>
      <Link to="" replace>
        Try again
      </Link>
    </div>
  );
}
