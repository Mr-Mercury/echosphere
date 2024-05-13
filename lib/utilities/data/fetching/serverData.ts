import { generateRandomServer } from "../../mocking/mock";
import { fakeUser } from "../../mocking/mock";

export const getServerById = async (id:string) => {
    const servers = fakeUser.servers
    return servers[0];
}