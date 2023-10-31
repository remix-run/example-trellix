import { Link, useFetchers, useLoaderData } from "@remix-run/react";
import { action } from "./server";
import { loader } from "./server";
import { INTENTS } from "./INTENTS";
import { Column } from "./column";
import { Card } from "./card";
import { NewColumn } from "./new-column";
import { useLayoutEffect, useRef, useState } from "react";
import invariant from "tiny-invariant";

export { loader, action };

export default function Board() {
  let { board } = useLoaderData<typeof loader>();

  let movingFetchers = useMovingCards();
  let addingColumns = useAddingColumns();

  type Column = (typeof board.columns)[0] | (typeof addingColumns)[0];
  type ColumnWithItems = Column & { items: typeof board.items };

  // copy the columns so we can add items to them, including optimistic items
  let columns = [...board.columns, ...addingColumns].reduce(
    (map, column) => map.set(column.id, { ...column, items: [] }),
    new Map<number, ColumnWithItems>(),
  );

  // add items to their columns
  for (let item of board.items) {
    // check optimistic versions first
    let movingItem = movingFetchers.get(item.id);
    let columnId = movingItem ? movingItem.columnId : item.columnId;
    let column = columns.get(columnId);
    invariant(column, "missing column");
    column.items.push(movingItem ? { ...item, order: movingItem.order } : item);
  }

  let scrollContainerRef = useRef<HTMLDivElement>(null);
  function scrollRight() {
    console.log("scroll");
    invariant(scrollContainerRef.current);
    scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
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
              items={col.items.map(({ title, order, id, content }) => ({
                title,
                order,
                id,
                content,
              }))}
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
  type CreateColumnFetcher = ReturnType<typeof useFetchers>[0] & { formData: FormData };

  return useFetchers()
    .filter((fetcher): fetcher is CreateColumnFetcher => {
      return fetcher.formData?.get("intent") === INTENTS.createColumn;
    })
    .map((fetcher) => {
      let name = String(fetcher.formData.get("name"));
      let TODO_useClientIds = Number(fetcher.formData.get("clientId"));
      return { name, id: TODO_useClientIds };
    });
}

function useMovingCards() {
  type MovingFetcher = ReturnType<typeof useFetchers>[0] & {
    json: { cardId: number; columnId: number; order: number };
  };

  return useFetchers()
    .filter((fetcher): fetcher is MovingFetcher => {
      let json = fetcher.json as unknown as any;
      return json && json.intent === INTENTS.moveItem;
    })
    .reduce((map, fetcher) => {
      let { cardId, columnId, order } = fetcher.json;
      return map.set(cardId, { columnId, order });
    }, new Map<number, { columnId: number; order: number }>());
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
