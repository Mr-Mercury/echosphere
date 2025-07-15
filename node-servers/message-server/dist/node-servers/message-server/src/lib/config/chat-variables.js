export var ChatFrequency;
(function (ChatFrequency) {
    ChatFrequency["High"] = "high";
    ChatFrequency["Average"] = "average";
    ChatFrequency["Low"] = "low";
    ChatFrequency["ExtremeAnxiety"] = "extreme anxiety (warning - expensive!)";
})(ChatFrequency || (ChatFrequency = {}));
export const ChatFrequencyMsgPerMinute = {
    [ChatFrequency.High]: 5,
    [ChatFrequency.Average]: 3,
    [ChatFrequency.Low]: 1,
    [ChatFrequency.ExtremeAnxiety]: 10,
};
//# sourceMappingURL=chat-variables.js.map