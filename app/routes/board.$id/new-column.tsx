import { useState, useRef } from "react";
import { flushSync } from "react-dom";
import invariant from "tiny-invariant";
import { INTENTS } from "./INTENTS";
import { Form, useSubmit } from "@remix-run/react";
import { Icon } from "../../icons/icons";

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
      className="p-2 flex-shrink-0 flex flex-col gap-5 overflow-hidden max-h-full w-80 border rounded-xl shadow bg-stone-100"
      onSubmit={(event) => {
        event.preventDefault();
        submit(event.currentTarget, { navigate: false });
        invariant(inputRef.current, "missing input ref");
        inputRef.current.value = "";
        // TODO: this doesn't work anymore since I'm not controlling the state
        // update, `submit` is, I used to wrap in flushSync and then `onAdd`
        // to scroll, but can't anymore with `submit`
        // onAdd();
      }}
    >
      <input type="hidden" name="intent" value={INTENTS.createColumn} />
      <input type="hidden" name="boardId" value={boardId} />
      <input type="hidden" name="clientId" value={Math.random().toString().slice(2, 8)} />
      <input
        autoFocus
        ref={inputRef}
        type="text"
        name="name"
        className="border border-stone-400 w-full rounded-lg py-1 px-2 font-medium text-black"
      />
      <div className="flex justify-between">
        <button type="submit" className="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue">
          Save Column
        </button>
        <button
          type="button"
          onClick={() => setEdit(false)}
          className="text-sm rounded-lg text-left p-2 font-medium hover:bg-stone-200 focus:bg-stone-200"
        >
          Cancel
        </button>
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
