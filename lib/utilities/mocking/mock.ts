import { User } from '@prisma/client';
import { Channel } from '@prisma/client';
import { Server } from '@prisma/client';
import { uniqueNamesGenerator, starWars, adjectives, colors, animals} from 'unique-names-generator'
import { string } from 'zod';

export const mockDelay = 500;
export const mockFriends = 10;
export const mockChannels = 8;
export const mockServers = 15;

function generateRandomId() {
    const id = Math.random()*10000000000000000;
    return id.toString();
}

function randomBool() {
    return Math.floor(Math.random() * 2) === 1;
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
            return 'Online';
        case 1: 
            return 'Away';
        case 2: 
            return 'Offline';
        case 3: 
            return 'Mobile';
    }
    return 'Online';
}

export const generateRandomBot = (quantity: number): User[] => {
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
            servers: [],
        }));
    // @ts-ignore TODO: Match return types to prisma schema
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
            contents: undefined,
            channels: generateRandomChannels(10)
        }))
    // @ts-ignore TODO: Make mocking work with new type
    return serverArray;
}

export const generateRandomChannels = (quantity: number): Channel[] => {
    const channelArray = Array.from({length: quantity}, 
        (undef, i) => ({
            id: generateRandomId(),
            name: generateRandomString(15),
            type: 'Public',
            allowedUser: null,
            newActivity: false,
            multipleHumans: false,
            aliveWithoutHumans: false,
            dm: randomBool(),
            activity: null,
        }))
    // @ts-ignore TODO: Make mocking work with new types
    return channelArray;
}


export const getRandomBot = (id: string) => {
    return {...generateRandomBot(1)[0], id}
};


// Create new fake user generation later when necessary. 

// export const fakeUser: User = {
//     id: generateRandomId(),
//     name: "Hobbo Bobbo",
//     username: "TestGoblin",
//     status: 'Online',
//     friendId: generateRandomString(5),
//     currentServer: generateRandomServer(1)[0],

// }

export const generateRandomUsername = () => {
    const randomName: string = uniqueNamesGenerator({
        dictionaries: [adjectives, colors, animals]
    });
    return randomName;
}

export const generateRandomName = () => {
    const randomName: string = uniqueNamesGenerator({
        dictionaries: [starWars]
    })
    return randomName;
}
