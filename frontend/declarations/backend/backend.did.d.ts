import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface Element {
  'id' : string,
  'name' : string,
  'position' : Position,
}
export interface OfficeState {
  'layout' : Array<Array<bigint>>,
  'characterPosition' : Position,
  'elements' : Array<Element>,
}
export interface Position { 'x' : bigint, 'y' : bigint }
export type Result = { 'ok' : null } |
  { 'err' : string };
export type Result_1 = { 'ok' : string } |
  { 'err' : string };
export interface _SERVICE {
  'getOfficeState' : ActorMethod<[], OfficeState>,
  'initializeOffice' : ActorMethod<[], Result>,
  'interactWithElement' : ActorMethod<[string], Result_1>,
  'moveCharacter' : ActorMethod<[bigint, bigint], Result>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
