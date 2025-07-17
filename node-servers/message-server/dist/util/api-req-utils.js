export function abortControllerAssembler(timeout) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);
    return { abortController, timeoutId };
}
//# sourceMappingURL=api-req-utils.js.map