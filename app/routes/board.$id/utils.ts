import invariant from "tiny-invariant";
import { ItemMutation, ItemMutationFields } from "./types";

export function parseItemMutation(formData: FormData): ItemMutation {
  let id = ItemMutationFields.id.type(formData.get("id"));
  invariant(id, "Missing item id");

  let columnId = ItemMutationFields.columnId.type(formData.get("columnId"));
  invariant(columnId, "Missing column id");

  let order = ItemMutationFields.order.type(formData.get("order"));
  invariant(typeof order === "number", "Missing order");

  let title = ItemMutationFields.title.type(formData.get("title"));
  invariant(title, "Missing title");

  return { id, columnId, order, title };
}
