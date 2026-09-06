import { useParams } from "react-router-dom"
import CareerSupportDetailWorkspace from "../../components/career/CareerSupportDetailWorkspace"

export default function CareerOSSupportDetailPage() {
  const { id } = useParams<{ id: string }>()
  if (!id) return null
  return <CareerSupportDetailWorkspace requestId={id} />
}
