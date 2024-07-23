import { DeterministicMap } from '../../deterministic/DeterministicMap';
import { DeterministicSet } from '../../deterministic/DeterminisiticSet';

export const ADDRESS_BYTE_LENGTH: number = 66;

export type MemorySlotPointer = bigint;

export type MemorySlotData<T> = T;
export type PointerStorage = DeterministicMap<MemorySlotPointer, MemorySlotData<bigint>>;
export type BlockchainStorage = DeterministicMap<Address, PointerStorage>;

export type Address = string;
export type i32 = number;
export type u8 = number;
export type u16 = number;
export type u32 = number;
export type f32 = number;

export type u64 = bigint;

export type Selector = number;

export interface ABIRegistryItem {
    name: string;
    selector: Selector;
}

export type ContractABIMap = DeterministicSet<Selector>;
export type SelectorsMap = DeterministicMap<string, Selector>;

export type MethodMap = DeterministicSet<Selector>;

export const MAX_EVENT_DATA_SIZE: number = 352; // 352 bytes max
export const MAX_EVENTS: number = 1000; // 1000 events max per calls.
