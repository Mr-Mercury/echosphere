import { UserType, UserStatus } from '@/lib/entities/user';
import { Channel } from '@/lib/entities/channel';
import { Server } from '@/lib/entities/server';
import { Activity } from '@/lib/entities/activity';



export const mockDelay = 500;
export const mockFriends = 10;
export const mockChannels = 8;
export const mockServers = 15;

export const FakeUser:UserType = {
    id: generateRandomId(),
    name: "Hobbo Bobbo",
    username: "TestGoblin",
    status: UserStatus.Online,
}


function generateRandomId() {
    const id = Math.random()*10000000000000000;
    return id.toString();
}

function generateRandomString(num: number) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let word = '';
    let length = Math.floor(Math.random() * num);

    for (let i = 0; i < length; i++) {
        word += letters.charAt(Math.floor(Math.random() * letters.length))
    }

    return word
}

function generateRandomSentence(words: number) {
    let result = '';

    for (let i = 0; i < words; i++) {
        result += generateRandomString(12);
        result += ' ';
    }

    result += '.';
    return result
}

function generateRandomParagraph(sentences: number) {
    let result = '';
    
    for (let i = 0; i < sentences; i++) {
        result += generateRandomSentence(Math.floor(Math.random() * 5))
        result += '  ';
    }

    return result;
}

function generateRandomStatus() {
    const value = Math.floor(Math.random() * 4);
    switch (value) {
        case 0:
            return UserStatus.Online;
        case 1: 
            return UserStatus.Away;
        case 2: 
            return UserStatus.Offline;
        case 3: 
            return UserStatus.Mobile;
    }
    return UserStatus.Online;
}

export const generateRandomBot = (quantity: number): UserType[] => {
    const userArray = Array.from({length: quantity}, 
        (undef, i) => ({
            id: generateRandomId(),
            name: generateRandomString(15),
            username: generateRandomString(10),
            avatar: 'https://picsum.photos/64', 
            bio: generateRandomParagraph(3),
            statusMessage: generateRandomSentence(3),
            status: generateRandomStatus(),
            activity: null,
            human: false,
        }));
    return userArray;
}

export const generateRandomServer = (quantity: number): Server[] => {
    const serverArray = Array.from({length: quantity}, 
        (undef, i) => ({
            id: generateRandomId(),
            name: generateRandomString(15),
            image: 'https://picsum.photos/64',
            messages: i === 0 ? 3 : undefined,
            entities: Math.random()*100,
            multipleHumans: false,
            aliveWithoutHumans: false,
            contents: null,
        }))
}

export const getRandomBot = (id: string) => {
    return {...generateRandomBot(1)[0], id}
};

