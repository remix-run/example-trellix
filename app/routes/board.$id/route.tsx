import {
  useState,
  type ReactNode,
  useEffect,
  useRef,
  useLayoutEffect,
} from "react";
import {
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import { useFetcher, useFetchers, useLoaderData } from "@remix-run/react";
import { requireAuthCookie } from "~/auth/auth";
import invariant from "tiny-invariant";
import {
  getBoardData,
  createEmptyColumn,
  updateColumnName,
  createItem,
} from "./query";
import { badRequest, notFound } from "~/http/bad-response";
import { Icon } from "./icons";

const INTENTS = {
  newColumn: "newColumn" as const,
  updateColumn: "updateColumn" as const,
  createItem: "createItem" as const,
};

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireAuthCookie(request);

  let id = Number(params.id);
  invariant(id, "Missing board ID");

  let board = await getBoardData(id);
  if (!board) throw notFound();

  return { board };
}

export async function action({ request, params }: ActionFunctionArgs) {
  let id = Number(params.id);
  invariant(id, "Missing board ID");

  let data = await request.formData();
  let intent = String(data.get("intent"));
  if (!intent) throw badRequest("Missing intent");

  switch (intent) {
    case INTENTS.newColumn: {
      await createEmptyColumn(id);
      break;
    }
    case INTENTS.updateColumn: {
      let name = String(data.get("name"));
      let columnId = Number(data.get("columnId"));
      if (!name || !columnId) throw badRequest("Missing name or columnId");
      await updateColumnName(columnId, name);
      break;
    }
    case INTENTS.createItem: {
      let title = String(data.get("title"));
      let columnId = Number(data.get("columnId"));
      if (!title || !columnId) throw badRequest("Missing title or columnId");
      await createItem(columnId, title);
      break;
    }
  }

  return request.headers.get("Sec-Fetch-Dest") === "document"
    ? redirect(`/board/${id}`)
    : { ok: true };
}

export default function Board() {
  let { board } = useLoaderData<typeof loader>();

  return (
    <div
      className="h-full min-h-0 flex flex-col overflow-x-scroll"
      style={{ backgroundColor: board.color }}
    >
      <h1 className="px-8 my-4 text-2xl font-medium">{board.name}</h1>
      <div className="flex flex-grow min-h-0 h-full items-start gap-4 px-8 pb-4">
        {board.columns.map((col, index) => (
          <Column key={col.id} name={col.name} id={col.id}>
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

function Column({
  children,
  name,
  id,
}: {
  children: ReactNode;
  name: string;
  id: number;
}) {
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
    <div className="flex-shrink-0 flex flex-col overflow-hidden max-h-full w-80 border rounded-xl shadow bg-stone-100">
      <div className="p-2">
        {edit ? (
          <fetcher.Form
            method="post"
            onBlur={(event) => {
              fetcher.submit(event.currentTarget);
            }}
          >
            <input type="hidden" name="intent" value={INTENTS.updateColumn} />
            <input type="hidden" name="columnId" value={id} />
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

      <ul className="flex-grow mt-1 overflow-auto">{children}</ul>

      <NewCard columnId={id} />
    </div>
  );
}

function NewCard({ columnId }: { columnId: number }) {
  let [edit, setEdit] = useState(false);
  let fetcher = useFetcher<typeof action>();
  let ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    if (fetcher.state === "submitting") {
      if (ref.current) ref.current.value = "";
    }
  }, [fetcher]);

  return edit ? (
    <fetcher.Form
      method="post"
      className="p-2 border-t-2 border-b-2 border-transparent -mb-[2px]"
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
            setEdit(false);
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
  ) : (
    <div className="p-1">
      <button
        type="button"
        onClick={() => {
          setEdit(true);
        }}
        className="flex items-center gap-2 rounded-lg text-left w-full p-2 font-medium text-stone-500 hover:bg-stone-200 focus:bg-stone-200"
      >
        <Icon name="plus" /> Add a card
      </button>
    </div>
  );
}

function Card({
  title,
  content,
  id,
}: {
  title: string;
  content: string | null;
  id: number;
}) {
  let [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");
  return (
    <li
      onDragOver={(event) => {
        console.log(event.dataTransfer.types);
        if (event.dataTransfer.types.includes("application/remix-demo")) {
          event.preventDefault();
          let rect = event.currentTarget.getBoundingClientRect();
          let midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(event.clientY < midpoint ? "top" : "bottom");
        }
      }}
      onDragLeave={() => {
        setAcceptDrop("none");
      }}
      onDrop={(event) => {
        let data = event.dataTransfer.getData("application/remix-demo");
        setAcceptDrop("none");
        console.log(data);
      }}
      className={
        "border-t-2 border-b-2 -mb-[2px] cursor-grab active:cursor-grabbing px-2 py-1 " +
        (acceptDrop === "top"
          ? "border-t-brand-red border-b-transparent"
          : acceptDrop === "bottom"
          ? "border-b-brand-red border-t-transparent"
          : "border-t-transparent border-b-transparent")
      }
    >
      <div
        className="bg-white shadow text-sm rounded-lg w-full py-1 px-2"
        draggable
        onDragStart={(event) => {
          console.log("drag start", title);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/remix-demo", String(id));
        }}
      >
        <h3>{title}</h3>
        <div className="mt-2">{content || <>&nbsp;</>}</div>
      </div>
    </li>
  );
}
