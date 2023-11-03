import { useState, useRef } from "react";
import { flushSync } from "react-dom";
import invariant from "tiny-invariant";
import { Icon } from "~/icons/icons";
import { Form, useSubmit } from "@remix-run/react";

import { INTENTS } from "./types";
import { CancelButton, SaveButton } from "./components";

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
  let inputRef = useRef<HTMLInputElement>(null);
  let submit = useSubmit();

  return edit ? (
    <Form
      method="post"
      navigate={false}
      className="p-2 flex-shrink-0 flex flex-col gap-5 overflow-hidden max-h-full w-80 border rounded-xl shadow bg-slate-100"
      onSubmit={(event) => {
        event.preventDefault();
        let formData = new FormData(event.currentTarget);
        formData.set("id", crypto.randomUUID());
        submit(formData, { navigate: false, method: "post" });
        onAdd();
        invariant(inputRef.current, "missing input ref");
        inputRef.current.value = "";
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setEdit(false);
        }
      }}
    >
      <input type="hidden" name="intent" value={INTENTS.createColumn} />
      <input type="hidden" name="boardId" value={boardId} />
      <input
        autoFocus
        ref={inputRef}
        type="text"
        name="name"
        className="border border-slate-400 w-full rounded-lg py-1 px-2 font-medium text-black"
      />
      <div className="flex justify-between">
        <SaveButton>Save Column</SaveButton>
        <CancelButton onClick={() => setEdit(false)}>Cancel</CancelButton>
      </div>
    </Form>
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
  );
}
