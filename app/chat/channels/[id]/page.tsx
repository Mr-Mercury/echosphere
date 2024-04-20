import { ServerType } from "@/lib/entities/server";
import { generateRandomServer } from "@/lib/utils/mocking/mock";

const getServerById = async () => {
  const server = generateRandomServer(1);
  return server[0];
}

const ServerPage = async ({ params }: { params: {id: string}}) => {
  const server = getServerById();

  return (
    <div>{params.id}</div>
  )
}

export default ServerPage;