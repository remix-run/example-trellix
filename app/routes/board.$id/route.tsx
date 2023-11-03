import { type MetaFunction } from "@remix-run/node";

import { loader, action } from "./server";
import { Board } from "./board";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [{ title: `${data ? data.board.name : "Board"} | Trellix` }];
};

export { loader, action, Board as default };
