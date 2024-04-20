import { ServerType } from "@/lib/entities/server"
import { generateRandomServer } from "@/lib/utils/mocking/mock"


async function getServerById(id:string) {
    const channel = generateRandomServer(1);
    return { channel }
}

export default async function ServerPage({
params,}: {
    params: { id: string };
  }) {
    const { channel } = await getServerById(params.id);
    return (
        <div>
            { params.id }
        </div>
    );
  }