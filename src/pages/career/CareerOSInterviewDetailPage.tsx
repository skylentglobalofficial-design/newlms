import { useParams } from "react-router-dom"
import InterviewDetailWorkspace from "../../components/career/InterviewDetailWorkspace"

export default function CareerOSInterviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <InterviewDetailWorkspace roundId={id} />
}
