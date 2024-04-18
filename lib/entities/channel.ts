import { Activity } from './activity';

enum ChannelTypes {
    Public = 'public',
    Private = 'private',
}
// Multiple humans boolean or null to handle DMs - dms 
// will be handled like private servers. 
export type Channel = {
    type: ChannelTypes;
    id: string;
    name: string;
    allowedUsers?: Array<string> | null; 
    newActivity?: boolean;
    multipleHumans?: boolean | null;
    aliveWithoutHumans?: boolean | null;
    dm: boolean;
    activity?: Activity;
    avatar?: string | null;
}