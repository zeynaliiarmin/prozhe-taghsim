import type { ReactNode } from 'react';

type ModalProps = { open?: boolean; children: ReactNode };
export default function Modal({ open = true, children }: ModalProps) {
  if (!open) return null;
  return <>{children}</>;
}