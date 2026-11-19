import Link from "next/link";

const MODELS = [
  { id: "sonic", label: "Argo Sonic", href: "/order" },
  { id: "flex", label: "Argo Flex", href: "/order/flex" },
  { id: "influence", label: "Argo Influence", href: "/order/influence" },
  { id: "uno", label: "Argo Uno", href: "/order/uno" },
] as const;

export function OrderModelSwitch({ active }: { active: "sonic" | "flex" | "influence" | "uno" }) {
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
