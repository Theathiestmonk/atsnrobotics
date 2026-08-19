import Link from "next/link";

const MODELS = [
  { id: "sonic", label: "ARGO Sonic", href: "/order" },
  { id: "flex", label: "ARGO Flex", href: "/order/flex" },
] as const;

export function OrderModelSwitch({ active }: { active: "sonic" | "flex" }) {
  return (
    <div className="orderModelSwitch">
      {MODELS.map((model) => (
        <Link
          key={model.id}
          href={model.href}
          className="orderModelSwitch__item"
          data-active={model.id === active}
        >
          {model.label}
        </Link>
      ))}
    </div>
  );
}
