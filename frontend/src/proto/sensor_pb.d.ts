import * as jspb from 'google-protobuf'



export class Reading extends jspb.Message {
  getSensor(): string;
  setSensor(value: string): Reading;

  getValue(): number;
  setValue(value: number): Reading;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Reading.AsObject;
  static toObject(includeInstance: boolean, msg: Reading): Reading.AsObject;
  static serializeBinaryToWriter(message: Reading, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Reading;
  static deserializeBinaryFromReader(message: Reading, reader: jspb.BinaryReader): Reading;
}

export namespace Reading {
  export type AsObject = {
    sensor: string,
    value: number,
  }
}

export class Configure extends jspb.Message {
  getSensor(): string;
  setSensor(value: string): Configure;

  getParent(): number;
  setParent(value: number): Configure;

  getType(): number;
  setType(value: number): Configure;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Configure.AsObject;
  static toObject(includeInstance: boolean, msg: Configure): Configure.AsObject;
  static serializeBinaryToWriter(message: Configure, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Configure;
  static deserializeBinaryFromReader(message: Configure, reader: jspb.BinaryReader): Configure;
}

export namespace Configure {
  export type AsObject = {
    sensor: string,
    parent: number,
    type: number,
  }
}

