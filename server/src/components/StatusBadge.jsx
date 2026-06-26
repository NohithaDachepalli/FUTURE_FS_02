
import { statusTone } from '../lib/format';

export default function StatusBadge({ status }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusTone[status] || statusTone.Closed}`}>
      {status}
    </span>
  );
}

