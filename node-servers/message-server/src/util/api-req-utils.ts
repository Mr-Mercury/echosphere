export function abortControllerAssembler(timeout: number) {
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), timeout);
    return { abortController, timeoutId };
}

