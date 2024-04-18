import {Activity} from './activity'

// Bot DMs, if enabled, will react to user status
// Away will send one message, then nothing til response
// Online is freely sending based on bot settings
// Offline is nothing sent (maybe setting for grand
// events simulating real relationships? e.g. marriage etc.)
// Mobile prefers sending short, shallow messages?  

enum UserStatus {
    Away = 'away',
    Online = 'online',
    Offline = 'offline',
    Mobile = 'mobile',
}

// May not end up using bio, but have bot react to it somehow
export interface User {
    id: String;
    name: String;
    username: String;
    avatar?: String | null;
    bio?: String | null;
    statusMessage?: String | null;
    status: UserStatus;
    activity?: Activity;
    human?: Boolean;
}