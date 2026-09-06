import { useParams } from "react-router-dom"
import ApplicationDetailWorkspace from "../../components/career/ApplicationDetailWorkspace"

export default function CareerOSApplicationDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <ApplicationDetailWorkspace applicationId={id} />
}
