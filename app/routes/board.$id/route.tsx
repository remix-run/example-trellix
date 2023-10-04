import { useFetcher, useLoaderData } from "@remix-run/react";
import { Icon } from "~/icons/icons";
import { INTENTS, loader, action } from "./data";
import { Column } from "./column";
import { Card } from "./card";

export { loader, action };

export default function Board() {
  let { board } = useLoaderData<typeof loader>();

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-x-scroll"
      style={{ backgroundColor: board.color }}
    >
      <h1 className="px-8 my-4 text-2xl font-medium">{board.name}</h1>

      <div className="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
        {board.columns.map((col) => (
          <Column key={col.id} name={col.name} columnId={col.id}>
            {col.items.map((item) => (
              <Card
                key={item.id}
                title={item.title}
                content={item.content}
                id={item.id}
              />
            ))}
          </Column>
        ))}

        <NewColumn />
      </div>
    </div>
  );
}

function NewColumn() {
  let fetcher = useFetcher<typeof action>();

  return (
    <fetcher.Form method="post">
      <button
        aria-label="new column"
        name="intent"
        value={INTENTS.newColumn}
        className="flex justify-center h-16 w-16 bg-black hover:bg-white bg-opacity-10 hover:bg-opacity-5 rounded"
      >
        <Icon name="plus" size="xl" />
      </button>
    </fetcher.Form>
  );
}
