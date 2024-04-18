export type Server = {
    id: String;
    name: String;
    image: String;
    messages?: Number;
    entities?: Number;
    multipleHumans?: Boolean | null;
    aliveWithoutHumans?: Boolean | null;
    // CHANGE THIS LATER ~~
    contents?: object;
}