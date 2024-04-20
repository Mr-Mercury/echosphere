import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"


const getServerById = (id:string) => {
    const server = generateRandomServer(1);
    return { server }
}

export default function ServerPage({ params }: { params: { id: string } }) {
    return <div>My Server: {params.id}</div>
  }