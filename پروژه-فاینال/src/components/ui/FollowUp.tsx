export type FollowUpSlot = null | 'done' | 'miss';

export type FollowUpProps = {
  slots?: FollowUpSlot[];
  onChange?: (slots: FollowUpSlot[]) => void;
};

export default function FollowUp({ slots = [], onChange }: FollowUpProps) {
  return <div data-component="FollowUp" data-count={slots.length} onClick={() => onChange?.(slots)} />;
}
