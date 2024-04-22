import { SingleChannel } from "./channel";


export type ServerType = {
    id: string;
    name: string;
    image: string;
    messages?: number;
    entities?: number;
    multipleHumans?: boolean | null;
    aliveWithoutHumans?: boolean | null;
    // CHANGE THIS LATER ~~
    channels?: SingleChannel[];
}