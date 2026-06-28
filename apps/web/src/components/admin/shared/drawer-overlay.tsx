
interface DrawerOverlayProps {
  onClick: () => void;
  opacity?: string;
}

export function DrawerOverlay({
  onClick,
  opacity = "bg-black/40",
}: DrawerOverlayProps) {
  return (
    <div
      className={`absolute inset-0 ${opacity}`}
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
