import { useState, type ReactNode, useLayoutEffect } from "react";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { type Company, getCompanies } from "~/fake-data";
import { groupCompanies, sortByStatusOrder } from "./utils";
import { Icon } from "./icons";

export async function loader(_: LoaderFunctionArgs) {
  return { companies: await getCompanies() };
}

export default function Board() {
  let { companies } = useLoaderData<typeof loader>();
  let columns = groupCompanies(companies, "status");

  return (
    <div className="h-full bg-white flex flex-col overflow-x-scroll">
      <div className="flex gap-4 h-full p-4">
        {Object.keys(columns)
          .sort(sortByStatusOrder(["New", "Active", "Inactive"]))
          .map(status => (
            <Column key={status} status={status} count={columns[status].length}>
              {columns[status].map(company => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </Column>
          ))}
      </div>
    </div>
  );
}

function Column({
  children,
  status,
  count,
}: {
  children: ReactNode;
  status: string;
  count: number;
}) {
  return (
    <div className="flex flex-shrink-0 flex-col h-full w-80 box-border border-gray-100 border rounded-md bg-gray-50">
      <h2 className="p-2">
        <span className="font-bold text-sm text-gray-800">{status}</span>{" "}
        <span className="bg-gray-100 text-xs min-w-[1.5em] text-center inline-block px-1 rounded-full">
          {count}
        </span>
      </h2>
      <ul className="flex-grow mt-1 overflow-auto">{children}</ul>
    </div>
  );
}

function CompanyCard({ company }: { company: Company }) {
  let [acceptDrop, setAcceptDrop] = useState<"none" | "top" | "bottom">("none");
  return (
    <li
      onDragOver={event => {
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
      onDrop={event => {
        let data = event.dataTransfer.getData("application/remix-demo");
        setAcceptDrop("none");
        console.log(data);
      }}
      className={
        "border-t-2 border-b-2 -mb-[2px] cursor-grab active:cursor-grabbing " +
        (acceptDrop === "top"
          ? "border-t-red-brand border-b-transparent"
          : acceptDrop === "bottom"
          ? "border-b-red-brand border-t-transparent"
          : "border-t-transparent border-b-transparent")
      }
    >
      <div
        className="bg-white p-2 my-1 mx-3 rounded shadow-sm border-gray-100 border"
        draggable
        onDragStart={event => {
          console.log("drag start", company.id);
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.setData("application/remix-demo", company.id);
        }}
      >
        <h3 className="font-bold">
          {company.name} {company.order}
        </h3>
        <div className="flex gap-2 text-gray-600">
          <Icon name="pin" /> <span>{company.city}</span>
        </div>
        <div className="flex gap-2 text-gray-600">
          <Icon name="mail" />{" "}
          <a href={`mailto:${company.email}`}>{company.contact}</a>
        </div>
      </div>
    </li>
  );
}
