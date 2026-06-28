
interface ModalOverlayProps {
  onClick: () => void;
}

export function ModalOverlay({ onClick }: ModalOverlayProps) {
  return (
    <div
      className="absolute inset-0 bg-black/40"
      onClick={onClick}
      aria-hidden="true"
    />
  );
}
