import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { flushSync } from "react-dom";
import invariant from "tiny-invariant";
import { action } from "./server";
import { INTENTS } from "./INTENTS";
import { useFetcher } from "@remix-run/react";
import { Icon } from "../../icons/icons";
import { Column } from "./column";

export function NewColumn({
  boardId,
  onAdd,
  editInitially,
}: {
  boardId: number;
  onAdd: () => void;
  editInitially: boolean;
}) {
  let [edit, setEdit] = useState(editInitially);

  return (
    <>
      {edit ? (
        <EditNewColumn
          boardId={boardId}
          onComplete={() => setEdit(false)}
          onAdd={onAdd}
        />
      ) : (
        <button
          onClick={() => {
            flushSync(() => {
              setEdit(true);
            });
            onAdd();
          }}
          aria-label="Add new column"
          className="flex-shrink-0 flex justify-center h-16 w-16 bg-black hover:bg-white bg-opacity-10 hover:bg-opacity-5 rounded-xl"
        >
          <Icon name="plus" size="xl" />
        </button>
      )}
    </>
  );
}

function EditNewColumn({
  boardId,
  onComplete,
  onAdd,
}: {
  boardId: number;
  onComplete: () => void;
  onAdd: () => void;
}) {
  let [pendingColumns, setPendingColumns] = useState<FormData[]>([]);
  let formRef = useRef<HTMLFormElement>(null);
  let inputRef = useRef<HTMLInputElement>(null);

  function submit() {
    invariant(formRef.current);
    invariant(inputRef.current);
    let formData = new FormData(formRef.current);
    flushSync(() => {
      setPendingColumns(pendingColumns.concat(formData));
    });
    onAdd();
    inputRef.current.value = "";
  }

  return (
    <>
      {pendingColumns.map((formData, index) => (
        <PendingNewColumn
          key={index}
          formData={formData}
          onComplete={() => {
            setPendingColumns(
              pendingColumns.filter((f) => f !== formData),
            );
          }}
        />
      ))}

      <form
        ref={formRef}
        className="p-2 flex-shrink-0 flex flex-col gap-5 overflow-hidden max-h-full w-80 border rounded-xl shadow bg-stone-100"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            onComplete();
          }
        }}
      >
        <input
          type="hidden"
          name="intent"
          value={INTENTS.createColumn}
        />
        <input type="hidden" name="boardId" value={boardId} />
        <input
          autoFocus
          ref={inputRef}
          type="text"
          name="name"
          className="border border-stone-400 w-full rounded-lg py-1 px-2 font-medium text-black"
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue"
          >
            Save Column
          </button>
          <button
            type="button"
            onClick={onComplete}
            className="text-sm rounded-lg text-left p-2 font-medium hover:bg-stone-200 focus:bg-stone-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

function PendingNewColumn({
  formData,
  onComplete,
}: {
  formData: FormData;
  onComplete: () => void;
}) {
  let fetcher = useFetcher<typeof action>();
  let name = String(formData.get("name"));

  useEffect(() => {
    fetcher.submit(formData, { method: "post" });
  }, []);

  useLayoutEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      onComplete();
    }
  }, [fetcher]);

  return <Column disabled name={name} />;
}
