import {
    Address,
    ADDRESS_BYTE_LENGTH,
    BlockchainStorage,
    i32,
    MethodMap,
    PointerStorage,
    PropertyABIMap,
    Selector,
    SelectorsMap,
    u16,
    u32,
    u64,
    u8,
} from './types/math.js';

import { BufferHelper } from '../utils/BufferHelper.js';
import { BinaryReader } from './BinaryReader.js';
import { cyrb53a } from '../utils/cyrb53.js';

export enum BufferDataType {
    U8 = 0,
    U16 = 1,
    U32 = 2,
    U64 = 3,
    U256 = 4,
    ADDRESS = 5,
    STRING = 6,
    BOOLEAN = 7,
}

export class BinaryWriter {
    private currentOffset: u32 = 0;
    private buffer: DataView;

    private selectorDatatype: u8[] = [];

    constructor(length: number = 0, private readonly trackDataTypes: boolean = false) {
        this.buffer = this.getDefaultBuffer(length);
    }

    public writeU8(value: u8): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.U8);

        this.allocSafe(1);
        this.buffer.setUint8(this.currentOffset++, value);
    }

    public writeU16(value: u16): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.U16);

        this.allocSafe(2);
        this.buffer.setUint16(this.currentOffset, value, true);
        this.currentOffset += 2;
    }

    public writeU32(value: u32, le: boolean = true): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.U32);

        this.allocSafe(4);
        this.buffer.setUint32(this.currentOffset, value, le);
        this.currentOffset += 4;
    }

    public writeU64(value: u64): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.U64);

        this.allocSafe(8);
        this.buffer.setBigUint64(this.currentOffset, value, true);
        this.currentOffset += 8;
    }

    public writeSelector(value: Selector): void {
        this.writeU32(value, false);
    }

    public writeBoolean(value: boolean): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.BOOLEAN);

        this.writeU8(value ? 1 : 0);
    }

    public writeU256(bigIntValue: bigint): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.U256);

        this.allocSafe(32);

        const bytesToHex = BufferHelper.valueToUint8Array(bigIntValue);
        if (bytesToHex.byteLength !== 32) {
            console.log('Invalid u256 value:', bytesToHex);

            throw new Error(`Invalid u256 value: ${bigIntValue}`);
        }

        for (let i = 0; i < bytesToHex.byteLength; i++) {
            this.writeU8(bytesToHex[i]);
        }
    }

    public writeBytes(value: Uint8Array | Buffer): void {
        this.allocSafe(value.byteLength);

        for (let i = 0; i < value.byteLength; i++) {
            this.writeU8(value[i]);
        }
    }

    public writeString(value: string): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.STRING);
        this.allocSafe(value.length);

        for (let i: i32 = 0; i < value.length; i++) {
            this.writeU8(value.charCodeAt(i));
        }
    }

    public writeAddress(value: Address): void {
        if(this.trackDataTypes) this.selectorDatatype.push(BufferDataType.ADDRESS);

        const bytes = this.fromAddress(value);
        this.writeBytes(bytes);
    }

    public writeStringWithLength(value: string): void {
        this.allocSafe(value.length + 2);

        this.writeU16(value.length);
        this.writeString(value);
    }

    public writeViewSelectorMap(map: SelectorsMap): void {
        this.writeU16(map.size);

        map.forEach(
            (value: PropertyABIMap, key: string, _map: Map<string, PropertyABIMap>): void => {
                this.writeAddress(key);
                this.writeSelectors(value);
            },
        );
    }

    public writeMethodSelectorsMap(map: MethodMap): void {
        this.writeU16(map.size);

        map.forEach(
            (value: Set<Selector>, key: Address, _map: Map<Address, Set<Selector>>): void => {
                this.writeAddress(key);
                this.writeMethodSelectorMap(value);
            },
        );
    }

    public getBuffer(clear: boolean = true): Uint8Array {
        const buf = new Uint8Array(this.buffer.byteLength);
        for (let i: u32 = 0; i < this.buffer.byteLength; i++) {
            buf[i] = this.buffer.getUint8(i);
        }

        if(clear) this.clear();

        return buf;
    }

    public reset(): void {
        this.currentOffset = 0;
        this.buffer = this.getDefaultBuffer(4);
    }

    public writeStorage(storage: BlockchainStorage): void {
        this.reset();
        this.writeU32(storage.size);

        const keys: Address[] = Array.from(storage.keys());
        const values: PointerStorage[] = Array.from(storage.values());

        for (let i: i32 = 0; i < keys.length; i++) {
            const address: Address = keys[i];
            const slots: Map<u64, u64> = values[i];

            this.writeAddress(address);
            this.writeU32(slots.size);

            const slotKeys: u64[] = Array.from(slots.keys());
            for (let j: i32 = 0; j < slotKeys.length; j++) {
                const slot: u64 = slotKeys[j];
                this.writeU256(slot);

                const slotValue = slots.get(slot);
                if (slotValue === undefined || slotValue === null) {
                    throw new Error(`Slot value not found.`);
                }

                this.writeU256(slotValue);
            }
        }
    }

    public writeTuple(values: bigint[]): void {
        this.allocSafe(4 + values.length * 32);
        this.writeU32(values.length);

        for (let i = 0; i < values.length; i++) {
            this.writeU256(values[i]);
        }
    }

    public toBytesReader(): BinaryReader {
        return new BinaryReader(this.getBuffer());
    }

    public getOffset(): u32 {
        return this.currentOffset;
    }

    public setOffset(offset: u32): void {
        this.currentOffset = offset;
    }

    public clear(): void {
        this.currentOffset = 0;
        this.buffer = this.getDefaultBuffer();
        this.selectorDatatype = [];
    }

    public allocSafe(size: u32): void {
        if (this.currentOffset + size > this.buffer.byteLength) {
            this.resize(size);
        }
    }

    public writeABISelector(name: string, selector: Selector): void {
        this.writeStringWithLength(name);
        this.writeSelector(selector);
    }

    public getSelectorDataType(): bigint {
        let hash: bigint = 0n;

        if (this.selectorDatatype.length === 0) return hash;

        return cyrb53a(this.selectorDatatype);
    }

    private getChecksum(): u32 {
        let checksum: u32 = 0;
        for (let i = 0; i < this.buffer.byteLength; i++) {
            checksum += this.buffer.getUint8(i);
        }

        return checksum % 2 ** 32;
    }

    private writeMethodSelectorMap(value: Set<Selector>): void {
        this.writeU16(value.size);

        value.forEach((selector: Selector, _value: Selector, _set: Set<Selector>): void => {
            this.writeSelector(selector);
        });
    }

    private writeSelectors(value: PropertyABIMap): void {
        this.writeU16(value.size);

        value.forEach((selector: Selector, key: string, _map: Map<string, Selector>): void => {
            this.writeABISelector(key, selector);
        });
    }

    public writeAddressValueTupleMap(map: Map<Address, bigint>): void {
        if (map.size > 65535) throw new Error('Map size is too large');

        this.writeU16(map.size);

        const keys = Array.from(map.keys());
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = map.get(key);

            if(value === null || value === undefined) throw new Error('Value not found');

            this.writeAddress(key);
            this.writeU256(value);
        }
    }

    public writeLimitedAddressBytesMap(map: Map<Address, Uint8Array[]>): void {
        if (map.size > 8) throw new Error('Too many contract calls');

        this.writeU8(map.size);

        const keys: Address[] = Array.from(map.keys());
        for (let i: i32 = 0; i < keys.length; i++) {
            const address: Address = keys[i];
            const calls: Uint8Array[] | undefined = map.get(address);

            if(!calls) throw new Error('Calls not found');
            if(calls.length > 10) throw new Error('Too many calls.');

            this.writeAddress(address);
            this.writeU8(calls.length);

            for (let j: i32 = 0; j < calls.length; j++) {
                this.writeBytesWithLength(calls[j]);
            }
        }
    }

    public writeBytesWithLength(value: Uint8Array): void {
        this.writeU32(value.length);
        this.writeBytes(value);
    }

    private fromAddress(value: Address): Uint8Array {
        if (value.length > ADDRESS_BYTE_LENGTH) {
            throw new Error('Address is too long');
        }

        const bytes: Uint8Array = new Uint8Array(ADDRESS_BYTE_LENGTH);
        for (let i: i32 = 0; i < value.length; i++) {
            bytes[i] = value.charCodeAt(i);
        }

        for (let i: u8 = value.length; i < ADDRESS_BYTE_LENGTH; i++) {
            bytes[i] = 0;
        }

        return bytes;
    }

    private resize(size: u32): void {
        const buf: Uint8Array = new Uint8Array(this.buffer.byteLength + size);

        for (let i: i32 = 0; i < this.buffer.byteLength; i++) {
            buf[i] = this.buffer.getUint8(i);
        }

        this.buffer = new DataView(buf.buffer);
    }

    private getDefaultBuffer(length: number = 0): DataView {
        return new DataView(new ArrayBuffer(length));
    }
}
