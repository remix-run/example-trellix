type Config = Record<string, StringConstructor | NumberConstructor>;

export function createForm(config: Config) {
  type Field<T> = (defaultValue: T) => any;
  type Form<T> = Record<string, Field<T>>;
  let fns: Form<string | number> = {};
  for (let key in config) {
    let constructr = config[key];
    fns[key] = (value: InstanceType<typeof constructr>) => {
      return {
        defaultValue: value,
      };
    };
  }
  return fns;
}

let form = createForm({
  cardId: Number,
});
form.cardId(4);
