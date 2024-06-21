export const ADDRESS_BYTE_LENGTH: number = 64;

export type MemorySlotPointer = bigint;

export type MemorySlotData<T> = T;
export type PointerStorage = Map<MemorySlotPointer, MemorySlotData<bigint>>;
export type BlockchainStorage = Map<Address, PointerStorage>;

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

export type ContractABIMap = Set<Selector>;
export type SelectorsMap = Map<string, Selector>;

export type MethodMap = Set<Selector>;

export const MAX_EVENT_DATA_SIZE: number = 256; // 256 bytes max
export const MAX_EVENTS: number = 8; // 8 events max per transactions.
