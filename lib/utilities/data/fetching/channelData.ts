import { generateRandomChannels } from "../../mocking/mock";
import { fakeUser } from "../../mocking/mock";

export const getChannelById = async (id:string) => {
    const channels = generateRandomChannels(1);
    return channels[0];
}