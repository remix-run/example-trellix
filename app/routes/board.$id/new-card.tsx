import { useState, useRef, useLayoutEffect, useEffect } from "react";
import { flushSync } from "react-dom";
import invariant from "tiny-invariant";
import { INTENTS, action } from "./controller";
import { Card } from "./card";
import { useFetcher } from "@remix-run/react";

export function NewCard({
  columnId,
  onComplete,
  onAddCard,
}: {
  columnId: number;
  onComplete: () => void;
  onAddCard: () => void;
}) {
  let [pendingCards, setPendingCards] = useState<FormData[]>([]);
  let formRef = useRef<HTMLFormElement>(null);
  let textAreaRef = useRef<HTMLTextAreaElement>(null);

  function submit() {
    invariant(formRef.current);
    invariant(textAreaRef.current);
    let formData = new FormData(formRef.current);
    flushSync(() => {
      setPendingCards(pendingCards.concat(formData));
    });
    onAddCard();
    textAreaRef.current.value = "";
  }

  return (
    <>
      {pendingCards.map((formData, index) => (
        <PendingNewCard
          key={index}
          formData={formData}
          onComplete={() => {
            setPendingCards(pendingCards.filter((f) => f !== formData));
          }}
        />
      ))}
      <form
        ref={formRef}
        className="px-2 py-1 border-t-2 border-b-2 border-transparent"
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
        <input type="hidden" name="intent" value={INTENTS.createItem} />
        <input type="hidden" name="columnId" value={columnId} />
        <textarea
          autoFocus
          ref={textAreaRef}
          name="title"
          placeholder="Enter a title for this card"
          className="outline-none shadow text-sm rounded-lg w-full py-1 px-2 resize-none placeholder:text-sm placeholder:text-stone-500 h-14"
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              submit();
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
      </form>
    </>
  );
}

function PendingNewCard({
  formData,
  onComplete,
}: {
  formData: FormData;
  onComplete: () => void;
}) {
  let fetcher = useFetcher<typeof action>();
  let title = String(formData.get("title"));

  useEffect(() => {
    fetcher.submit(formData, { method: "post" });
  }, []);

  useLayoutEffect(() => {
    if (fetcher.state === "idle" && fetcher.data?.ok) {
      onComplete();
    }
  }, [fetcher]);

  return <Card disabled title={title} />;
}
