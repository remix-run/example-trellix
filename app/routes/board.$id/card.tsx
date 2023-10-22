import { useSubmit, useLocation } from "@remix-run/react";
import { UNSAFE_DataRouterContext } from "react-router-dom";
import { useState, useContext } from "react";
import { INTENTS } from "./INTENTS";
import invariant from "tiny-invariant";
import { CONTENT_TYPES } from "./CONTENT_TYPES";

type CardProps =
  | {
      disabled?: undefined;
      title: string;
      content: string | null;
      id: number;
      columnId: number;
      order: number;
      nextOrder: number;
      previousOrder: number;
    }
  | {
      // TODO: stop doing disabled, use client ids and make
      // the whole thing work even when the network is dog slow
      disabled: true;
      content?: string;
      title?: string;
      id?: number;
      order?: number;
      columnId?: number;
      nextOrder?: number;
      previousOrder?: number;
    };

export function Card({ title, content, id, disabled, columnId, order, nextOrder, previousOrder }: CardProps) {
  let submit = useSubmit();

  let [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");

  return (
    <li
      onDragOver={(event) => {
        if (disabled) return;
        if (event.dataTransfer.types.includes(CONTENT_TYPES.card)) {
          event.preventDefault();
          event.stopPropagation();
          let rect = event.currentTarget.getBoundingClientRect();
          let midpoint = (rect.top + rect.bottom) / 2;
          setAcceptDrop(event.clientY <= midpoint ? "top" : "bottom");
        }
      }}
      onDragLeave={() => {
        if (disabled) return;
        setAcceptDrop("none");
      }}
      onDrop={(event) => {
        if (disabled) return;
        event.stopPropagation();

        let cardId = JSON.parse(event.dataTransfer.getData(CONTENT_TYPES.card));
        invariant(typeof cardId === "number", "missing cardId");

        let droppedOrder = acceptDrop === "top" ? previousOrder : nextOrder;
        let moveOrder = (droppedOrder + order) / 2;

        let json = {
          intent: INTENTS.moveItem,
          order: moveOrder,
          cardId: cardId,
          columnId: columnId,
        };

        submit(json, {
          method: "post",
          encType: "application/json",
          navigate: false,
          fetcherKey: `${INTENTS.moveItem}:${cardId}`,
        });

        setAcceptDrop("none");
      }}
      className={
        "border-t-2 border-b-2 -mb-[2px] last:mb-0 cursor-grab active:cursor-grabbing px-2 py-1 " +
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
          if (disabled) return;
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData(CONTENT_TYPES.card, String(id));
        }}
      >
        <h3>{title}</h3>
        <div className="mt-2">{content || <>&nbsp;</>}</div>
      </div>
    </li>
  );
}
