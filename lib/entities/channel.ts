import { Activity } from './activity';

export enum ChannelTypes {
    Public = 'public',
    Private = 'private',
}
// Multiple humans boolean or null to handle DMs - dms 
// will be handled like private servers. 
export type SingleChannel = {
    type: ChannelTypes;
    id: string;
    name: string;
    allowedUsers?: Array<string> | null; 
    newActivity?: boolean;
    multipleHumans?: boolean | null;
    aliveWithoutHumans?: boolean | null;
    dm: boolean;
    activity?: Activity | null;
}