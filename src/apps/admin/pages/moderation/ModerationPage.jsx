import { RecordsView } from '../../components/RecordsView'
import { Badge } from '@/shared/ui/Badge'

const rows = [
  { id: 'FLG-01', title: 'Reported recommendation', target: '@shakil_99', details: 'A community member reported an inaccurate product description.', priority: 'Medium', status: 'Needs review' },
  { id: 'FLG-02', title: 'Unusual return activity', target: 'Product #821', details: 'Review the sample return history and seller information before taking action.', priority: 'High', status: 'Needs review' },
]
const columns = [
  { key: 'title', label: 'Report', render: (row) => <span className="font-medium text-ink">{row.title}</span> },
  { key: 'target', label: 'Subject' },
  { key: 'details', label: 'Context', render: (row) => <span className="block max-w-xs leading-relaxed">{row.details}</span> },
  { key: 'priority', label: 'Priority', render: (row) => <Badge variant={row.priority === 'High' ? 'danger' : 'warning'}>{row.priority}</Badge> },
  { key: 'status', label: 'Status', render: (row) => <Badge variant="outline">{row.status}</Badge> },
]

export default function ModerationPage() {
  return <RecordsView title="Moderation" description="Review community reports with context before deciding on an action." rows={rows} columns={columns} statusKey="status" renderDetails={() => 'Review preview only. No penalties or account changes are applied.'} />
}
