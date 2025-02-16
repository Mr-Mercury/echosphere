export const sanitizeInput = (text: string) => {
    return text.replace(/[^a-zA-Z0-9\s]/g, '');
}