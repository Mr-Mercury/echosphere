import { generateRandomServer } from "../../mocking/mock";
import { ServerType } from "@/lib/entities/server";

export const getServerById = async (id:string) => {
    const server = generateRandomServer(1);
    return server[0];
}
