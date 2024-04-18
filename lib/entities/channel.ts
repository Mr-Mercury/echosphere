import { Activity } from './activity';

enum ChannelTypes {
    Public = 'public',
    Private = 'private',
}
// Multiple humans boolean or null to handle DMs - dms 
// will be handled like private servers. 
export type Channel = {
    type: ChannelTypes;
    id: String;
    name: String;
    allowedUsers?: Array<String> | null; 
    newActivity?: Boolean;
    multipleHumans?: Boolean | null;
    aliveWithoutHumans?: Boolean | null;
    dm: Boolean;
    activity?: Activity;
    avatar?: string | null;
}