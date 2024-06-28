import * as jspb from 'google-protobuf'



export class Devices extends jspb.Message {
  getAdoptedList(): Array<Device>;
  setAdoptedList(value: Array<Device>): Devices;
  clearAdoptedList(): Devices;
  addAdopted(value?: Device, index?: number): Device;

  getOrphanedList(): Array<Device>;
  setOrphanedList(value: Array<Device>): Devices;
  clearOrphanedList(): Devices;
  addOrphaned(value?: Device, index?: number): Device;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Devices.AsObject;
  static toObject(includeInstance: boolean, msg: Devices): Devices.AsObject;
  static serializeBinaryToWriter(message: Devices, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Devices;
  static deserializeBinaryFromReader(message: Devices, reader: jspb.BinaryReader): Devices;
}

export namespace Devices {
  export type AsObject = {
    adoptedList: Array<Device.AsObject>,
    orphanedList: Array<Device.AsObject>,
  }
}

export class Device extends jspb.Message {
  getName(): string;
  setName(value: string): Device;

  getType(): Device.Type;
  setType(value: Device.Type): Device;

  getIp(): string;
  setIp(value: string): Device;

  getMac(): string;
  setMac(value: string): Device;

  getAdopted(): boolean;
  setAdopted(value: boolean): Device;

  getZone(): number;
  setZone(value: number): Device;

  getId(): number;
  setId(value: number): Device;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Device.AsObject;
  static toObject(includeInstance: boolean, msg: Device): Device.AsObject;
  static serializeBinaryToWriter(message: Device, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Device;
  static deserializeBinaryFromReader(message: Device, reader: jspb.BinaryReader): Device;
}

export namespace Device {
  export type AsObject = {
    name: string,
    type: Device.Type,
    ip: string,
    mac: string,
    adopted: boolean,
    zone: number,
    id: number,
  }

  export enum Type { 
    UNKNOWN = 0,
    GREENHOUSE = 1,
    IRRIGATION = 2,
    SENSOR = 3,
    CHICKENCOOP = 4,
  }
}

export class Zone extends jspb.Message {
  getId(): number;
  setId(value: number): Zone;

  getName(): string;
  setName(value: string): Zone;

  getDevicesList(): Array<Device>;
  setDevicesList(value: Array<Device>): Zone;
  clearDevicesList(): Zone;
  addDevices(value?: Device, index?: number): Device;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Zone.AsObject;
  static toObject(includeInstance: boolean, msg: Zone): Zone.AsObject;
  static serializeBinaryToWriter(message: Zone, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Zone;
  static deserializeBinaryFromReader(message: Zone, reader: jspb.BinaryReader): Zone;
}

export namespace Zone {
  export type AsObject = {
    id: number,
    name: string,
    devicesList: Array<Device.AsObject>,
  }
}

export class Zones extends jspb.Message {
  getZonesList(): Array<Zone>;
  setZonesList(value: Array<Zone>): Zones;
  clearZonesList(): Zones;
  addZones(value?: Zone, index?: number): Zone;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Zones.AsObject;
  static toObject(includeInstance: boolean, msg: Zones): Zones.AsObject;
  static serializeBinaryToWriter(message: Zones, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Zones;
  static deserializeBinaryFromReader(message: Zones, reader: jspb.BinaryReader): Zones;
}

export namespace Zones {
  export type AsObject = {
    zonesList: Array<Zone.AsObject>,
  }
}

export class LoginRequest extends jspb.Message {
  getPassword(): string;
  setPassword(value: string): LoginRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginRequest.AsObject;
  static toObject(includeInstance: boolean, msg: LoginRequest): LoginRequest.AsObject;
  static serializeBinaryToWriter(message: LoginRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginRequest;
  static deserializeBinaryFromReader(message: LoginRequest, reader: jspb.BinaryReader): LoginRequest;
}

export namespace LoginRequest {
  export type AsObject = {
    password: string,
  }
}

export class LoginResponse extends jspb.Message {
  getJwt(): string;
  setJwt(value: string): LoginResponse;

  getExpiry(): string;
  setExpiry(value: string): LoginResponse;

  getSuccess(): boolean;
  setSuccess(value: boolean): LoginResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): LoginResponse.AsObject;
  static toObject(includeInstance: boolean, msg: LoginResponse): LoginResponse.AsObject;
  static serializeBinaryToWriter(message: LoginResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): LoginResponse;
  static deserializeBinaryFromReader(message: LoginResponse, reader: jspb.BinaryReader): LoginResponse;
}

export namespace LoginResponse {
  export type AsObject = {
    jwt: string,
    expiry: string,
    success: boolean,
  }
}

export class ZoneRequest extends jspb.Message {
  getZone(): number;
  setZone(value: number): ZoneRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): ZoneRequest.AsObject;
  static toObject(includeInstance: boolean, msg: ZoneRequest): ZoneRequest.AsObject;
  static serializeBinaryToWriter(message: ZoneRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): ZoneRequest;
  static deserializeBinaryFromReader(message: ZoneRequest, reader: jspb.BinaryReader): ZoneRequest;
}

export namespace ZoneRequest {
  export type AsObject = {
    zone: number,
  }
}

export class None extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): None.AsObject;
  static toObject(includeInstance: boolean, msg: None): None.AsObject;
  static serializeBinaryToWriter(message: None, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): None;
  static deserializeBinaryFromReader(message: None, reader: jspb.BinaryReader): None;
}

export namespace None {
  export type AsObject = {
  }
}

