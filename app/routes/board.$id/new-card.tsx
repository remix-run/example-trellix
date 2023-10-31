import { useRef } from "react";
import invariant from "tiny-invariant";
import { Form } from "@remix-run/react";
import { INTENTS } from "./INTENTS";

export function NewCard({
  columnId,
  nextOrder,
  onComplete,
  onAddCard,
}: {
  columnId: number;
  nextOrder: number;
  onComplete: () => void;
  onAddCard: () => void;
}) {
  let textAreaRef = useRef<HTMLTextAreaElement>(null);
  let buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <Form
      navigate={false}
      method="post"
      className="px-2 py-1 border-t-2 border-b-2 border-transparent"
      onSubmit={() => {
        // TODO: depends on <Form flushSync> currently patched
        requestAnimationFrame(() => {
          onAddCard();
          invariant(textAreaRef.current);
          textAreaRef.current.value = "";
        });
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          onComplete();
        }
      }}
    >
      <input type="hidden" name="intent" value={INTENTS.createItem} />
      <input type="hidden" name="columnId" value={columnId} />
      <input type="hidden" name="clientId" value={crypto.randomUUID()} />
      <input type="hidden" name="order" value={nextOrder} />
      <textarea
        autoFocus
        ref={textAreaRef}
        name="title"
        placeholder="Enter a title for this card"
        className="outline-none shadow text-sm rounded-lg w-full py-1 px-2 resize-none placeholder:text-sm placeholder:text-stone-500 h-14"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            invariant(buttonRef.current, "expected button ref");
            buttonRef.current.click();
          }
          if (event.key === "Escape") {
            onComplete();
          }
        }}
        onChange={(event) => {
          let el = event.currentTarget;
          el.style.height = el.scrollHeight + "px";
        }}
      />
      <div className="flex justify-between">
        <button
          ref={buttonRef}
          type="submit"
          className="text-sm rounded-lg text-left p-2 font-medium text-white bg-brand-blue"
        >
          Save Card
        </button>
        <button
          type="button"
          onClick={onComplete}
          className="text-sm rounded-lg text-left p-2 font-medium hover:bg-stone-200 focus:bg-stone-200"
        >
          Cancel
        </button>
      </div>
    </Form>
  );
}
