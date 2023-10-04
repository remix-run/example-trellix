import { useState } from "react";

export function Card({
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
