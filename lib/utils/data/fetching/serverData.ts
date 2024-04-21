import { generateRandomServer } from "../../mocking/mock";
import { fakeUser } from "../../mocking/mock";

export const getServerById = async (id:string) => {
    const servers = fakeUser.servers
    console.log(id);
    return servers[0];
}