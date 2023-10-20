import { Link, useFetchers, useLoaderData } from "@remix-run/react";
import { loader, action } from "./controller.server";
import { INTENTS } from "./INTENTS";
import { Column } from "./column";
import { Card } from "./card";
import { NewColumn } from "./new-column";
import { useRef } from "react";
import invariant from "tiny-invariant";

export { loader, action };

export default function Board() {
  let { board } = useLoaderData<typeof loader>();
  let fetchers = useFetchers();
  console.log(
    "fetchers",
    fetchers.map((f) => `${f.state}:${f.formData?.get("cardId")}`),
  );

  console.group();
  console.log(
    "board\t\t",
    board.columns.map((col) => col.items.length).join(" | "),
  );
  let colMap = new Map(
    board.columns.map((col) => [
      col.id,
      {
        ...col,
        // copy items cause we'll mutate them for optimistic UI
        items: [...col.items],
      },
    ]),
  );
  console.log(
    "map\t\t\t",
    [...colMap.values()].map((col) => col.items.length).join(" | "),
  );

  for (let fetcher of fetchers) {
    if (fetcher.formData?.get("intent") === INTENTS.moveItem) {
      // get the formData going over the network
      let newColumnId = Number(fetcher.formData.get("newColumnId"));
      let oldColumnId = Number(fetcher.formData.get("oldColumnId"));
      let cardId = Number(fetcher.formData.get("cardId"));
      let order = Number(fetcher.formData.get("order"));
      invariant(newColumnId, "missing newColumnId");
      invariant(oldColumnId, "missing newColumnId");
      invariant(cardId, "missing cardId");
      invariant(order, "missing order");

      // get the two columns
      let oldCol = colMap.get(oldColumnId);
      invariant(oldCol, "missing old column");
      let newCol = colMap.get(newColumnId);
      invariant(newCol, "missing new column");

      // remove the item from the old column
      let actualIndex = oldCol.items.findIndex(
        (item) => item.id === cardId,
      );
      invariant(actualIndex > -1, "missing item in old column");
      let [actualItem] = oldCol.items.splice(actualIndex, 1);

      // push it to the new one with the new order
      newCol.items.push({ ...actualItem, order });
    }
  }

  console.log(
    "map after\t",
    [...colMap.values()].map((col) => col.items.length).join(" | "),
  );
  console.groupEnd();

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
        {[...colMap.values()].map((col) => {
          return (
            <Column key={col.id} name={col.name} columnId={col.id}>
              {col.items
                .sort((a, b) => a.order - b.order)
                .map((item, index, items) => (
                  <Card
                    key={item.id}
                    title={item.title}
                    content={item.content}
                    id={item.id}
                    order={item.order}
                    // important to pass the item's column ID, because when it's
                    // optimistic it can be a different column than the one it's
                    // rendered in
                    columnId={item.columnId}
                    renderedColumnId={col.id}
                    previousOrder={
                      items[index - 1] ? items[index - 1].order : 0
                    }
                    nextOrder={
                      items[index + 1]
                        ? items[index + 1].order
                        : item.order + 1
                    }
                  />
                ))}
            </Column>
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
