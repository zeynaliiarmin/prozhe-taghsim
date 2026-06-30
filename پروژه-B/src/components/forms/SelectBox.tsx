import type { ReactNode } from 'react';

type SelectBoxProps = {
  children: ReactNode;
  value?: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
};

export function SelectBox({ children, style, onChange }: SelectBoxProps) {
  return (
    <div onClick={() => {}} style={style}>
      {children}
    </div>
  );
}