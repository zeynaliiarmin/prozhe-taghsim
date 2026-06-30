import type { ReactNode } from 'react';

type PopupProps = { open: boolean; children: ReactNode };
export default function Popup({ open, children }: PopupProps) {
  if (!open) return null;
  return <>{children}</>;
}