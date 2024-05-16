/*
    cyrb53 (c) 2018 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    A fast and simple 53-bit string hash function with decent collision resistance.
    Largely inspired by MurmurHash2/3, but with a focus on speed/simplicity.
*/
import { u8 } from '../buffer/types/math.js';

export const cyrb53 = (str: string, seed: number = 0) => {
    let h1 = 0xdeadbeef ^ seed,
        h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }

    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export function imul64(a: bigint, b: bigint): bigint {
    // Get the low and high parts of a
    const aLow = BigInt.asUintN(32, a);
    const aHigh = a >> 32n;

    // Get the low and high parts of b
    const bLow = BigInt.asUintN(32, b);
    const bHigh = b >> 32n;

    // Calculate the low part of the result
    const low = aLow * bLow;

    // Calculate the middle parts of the result
    const middle1 = (aHigh * bLow) << 32n;
    const middle2 = (aLow * bHigh) << 32n;

    // Calculate the high part of the result
    const high = (aHigh * bHigh) << 64n;

    // Add the parts together
    return low + middle1 + middle2 + high;
}

/*
    cyrb53a beta (c) 2023 bryc (github.com/bryc)
    License: Public domain (or MIT if needed). Attribution appreciated.
    This is a work-in-progress, and changes to the algorithm are expected.
    The original cyrb53 has a slight mixing bias in the low bits of h1.
    This doesn't affect collision rate, but I want to try to improve it.
    This new version has preliminary improvements in avalanche behavior.
*/
export const cyrb53a = function (str: u8[], seed: number = 0): bigint {
    let h1 = BigInt(0xdeadbeef ^ seed);
    let h2 = BigInt(0x41c6ce57 ^ seed);

    for (let i = 0, ch; i < str.length; i++) {
        ch = BigInt(str[i]);
        h1 = imul64(h1 ^ ch, 0x85ebca77n);
        h2 = imul64(h2 ^ ch, 0xc2b2ae3dn);
    }

    h1 ^= imul64(h1 ^ (h2 >> 15n), 0x735a2d97n);
    h2 ^= imul64(h2 ^ (h1 >> 15n), 0xcaf649a9n);
    h1 ^= h2 >> 16n;
    h2 ^= h1 >> 16n;

    return (2097152n * (h2 & 0xFFFFFFFFFFFFFFFFn) + (h1 >> 11n)) & 0xFFFFFFFFFFFFFFFFn;
};
