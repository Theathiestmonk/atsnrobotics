import Link from "next/link";

const MODELS = [
  { id: "sonic", label: "ARGO‑H · Sonic", href: "/order" },
  { id: "flex", label: "ARGO‑S · Flex", href: "/order/flex" },
  { id: "uno", label: "Argo Uno", href: "/order/uno" },
] as const;

export function OrderModelSwitch({ active }: { active: "sonic" | "flex" | "uno" }) {
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
