import invariant from "tiny-invariant";

export const INTENTS = {
  createColumn: "newColumn" as const,
  updateColumn: "updateColumn" as const,
  createItem: "createItem" as const,
  moveItem: "moveItem" as const,
  moveColumn: "moveColumn" as const,
};

export const ItemMutationFields = {
  id: { type: String, name: "id" },
  columnId: { type: String, name: "columnId" },
  order: { type: Number, name: "order" },
  title: { type: String, name: "title" },
} as const;

export type ItemMutation = MutationFromFields<typeof ItemMutationFields>;

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

////////////////////////////////////////////////////////////////////////////////
// Bonkers TypeScript
type ConstructorToType<T> = T extends typeof String
  ? string
  : T extends typeof Number
  ? number
  : never;

type MutationFromFields<T extends Record<string, any>> = {
  [K in keyof T]: ConstructorToType<T[K]["type"]>;
};
