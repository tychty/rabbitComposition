export function generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
        const random = Math.random() * 16 | 0, result = char == 'x' ? random : (random & 0x3 | 0x8);
        return result.toString(16);
    });
}