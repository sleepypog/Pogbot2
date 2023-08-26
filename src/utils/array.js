/**
 * Split an array into chunks.
 * @param {any[]} arr Original array
 * @param {number} len Chunk size
 * @returns Array with chunks.
 */
export function asChunks(arr, len) {
    let chunks = [];
    let i = 0;
    let n = arr.length;

    while (i < n) chunks.push(arr.slice(i, (i += len)));

    return chunks;
}
