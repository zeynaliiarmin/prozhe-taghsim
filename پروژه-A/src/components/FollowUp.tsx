export type FollowUpSlot = null | 'done' | 'miss';

export type FollowUpProps = {
  slots?: FollowUpSlot[];
  onChange?: (slots: FollowUpSlot[]) => void;
};

export default function FollowUp({ slots = [], onChange }: FollowUpProps) {
  return <div>FollowUp: {slots.join(', ')}</div>;
}