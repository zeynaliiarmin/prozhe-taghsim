import type { ReactNode } from 'react';

type StepperProps = {
  steps: string[];
  current: number;
  T: Record<string, string>;
  theme: Record<string, string>;
};

export default function Stepper({ steps, current, theme }: StepperProps) {
  return (
    <div style={{ display: 'flex', gap: 4, marginBottom: 24, justifyContent: 'center', direction: 'ltr' }}>
      {steps.map((step, idx) => (
        <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: idx <= current ? theme.acc : theme.brd,
            color: idx <= current ? '#fff' : theme.txt,
            fontSize: 12, fontWeight: 700,
            transition: 'all .3s',
          }}>
            {idx + 1}
          </div>
          {idx < steps.length - 1 && (
            <div style={{
              width: 24, height: 2,
              background: idx < current ? theme.acc : theme.brd,
              transition: 'all .3s',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}