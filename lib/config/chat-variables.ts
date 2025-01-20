export enum ChatFrequency {
    High = 'high',
    Average = 'average',
    Low = 'low',
    ExtremeAnxiety = 'extreme anxiety (warning - expensive!)',
}

export const ChatFrequencyMsgPerMinute = {
    [ChatFrequency.High]: 5,
    [ChatFrequency.Average]: 3,
    [ChatFrequency.Low]: 1,
    [ChatFrequency.ExtremeAnxiety]: 10,
}