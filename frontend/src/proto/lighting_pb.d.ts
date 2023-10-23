import * as jspb from 'google-protobuf'



export class Light extends jspb.Message {
  getPowered(): boolean;
  setPowered(value: boolean): Light;

  getType(): Type;
  setType(value: Type): Light;

  getColor(): number;
  setColor(value: number): Light;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Light.AsObject;
  static toObject(includeInstance: boolean, msg: Light): Light.AsObject;
  static serializeBinaryToWriter(message: Light, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Light;
  static deserializeBinaryFromReader(message: Light, reader: jspb.BinaryReader): Light;
}

export namespace Light {
  export type AsObject = {
    powered: boolean,
    type: Type,
    color: number,
  }
}

export enum Type { 
  RGB = 0,
  RGBW = 1,
}
