import iconsHref from "./icons.svg";

export function Icon({ name }: { name: string }) {
  return (
    <svg className="w-4 h-4 inline self-center">
      <use href={`${iconsHref}#${name}`} />
    </svg>
  );
}
