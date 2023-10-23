import * as jspb from 'google-protobuf'



export class Solenoid extends jspb.Message {
  getState(): Solenoid.State;
  setState(value: Solenoid.State): Solenoid;

  getPin(): number;
  setPin(value: number): Solenoid;

  getOverride(): boolean;
  setOverride(value: boolean): Solenoid;

  getLitrestodispense(): number;
  setLitrestodispense(value: number): Solenoid;

  getLengthofsoakerhose(): number;
  setLengthofsoakerhose(value: number): Solenoid;

  getLitresdispensed(): number;
  setLitresdispensed(value: number): Solenoid;

  getLastoverridden(): number;
  setLastoverridden(value: number): Solenoid;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Solenoid.AsObject;
  static toObject(includeInstance: boolean, msg: Solenoid): Solenoid.AsObject;
  static serializeBinaryToWriter(message: Solenoid, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Solenoid;
  static deserializeBinaryFromReader(message: Solenoid, reader: jspb.BinaryReader): Solenoid;
}

export namespace Solenoid {
  export type AsObject = {
    state: Solenoid.State,
    pin: number,
    override: boolean,
    litrestodispense: number,
    lengthofsoakerhose: number,
    litresdispensed: number,
    lastoverridden: number,
  }

  export enum State { 
    OFF = 0,
    ON = 1,
  }
}

export class Irrigator extends jspb.Message {
  getId(): number;
  setId(value: number): Irrigator;

  getSolenoidsList(): Array<Solenoid>;
  setSolenoidsList(value: Array<Solenoid>): Irrigator;
  clearSolenoidsList(): Irrigator;
  addSolenoids(value?: Solenoid, index?: number): Solenoid;

  getLastwatered(): number;
  setLastwatered(value: number): Irrigator;

  getTimestamp(): number;
  setTimestamp(value: number): Irrigator;

  getRainlockout(): boolean;
  setRainlockout(value: boolean): Irrigator;

  getLastlockout(): number;
  setLastlockout(value: number): Irrigator;

  getIrrigating(): boolean;
  setIrrigating(value: boolean): Irrigator;

  getTemperature(): number;
  setTemperature(value: number): Irrigator;

  getTiming(): number;
  setTiming(value: number): Irrigator;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Irrigator.AsObject;
  static toObject(includeInstance: boolean, msg: Irrigator): Irrigator.AsObject;
  static serializeBinaryToWriter(message: Irrigator, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Irrigator;
  static deserializeBinaryFromReader(message: Irrigator, reader: jspb.BinaryReader): Irrigator;
}

export namespace Irrigator {
  export type AsObject = {
    id: number,
    solenoidsList: Array<Solenoid.AsObject>,
    lastwatered: number,
    timestamp: number,
    rainlockout: boolean,
    lastlockout: number,
    irrigating: boolean,
    temperature: number,
    timing: number,
  }
}

export class IrrigationRequest extends jspb.Message {
  getId(): number;
  setId(value: number): IrrigationRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): IrrigationRequest.AsObject;
  static toObject(includeInstance: boolean, msg: IrrigationRequest): IrrigationRequest.AsObject;
  static serializeBinaryToWriter(message: IrrigationRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): IrrigationRequest;
  static deserializeBinaryFromReader(message: IrrigationRequest, reader: jspb.BinaryReader): IrrigationRequest;
}

export namespace IrrigationRequest {
  export type AsObject = {
    id: number,
  }
}

export class EmptyMessage extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): EmptyMessage.AsObject;
  static toObject(includeInstance: boolean, msg: EmptyMessage): EmptyMessage.AsObject;
  static serializeBinaryToWriter(message: EmptyMessage, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): EmptyMessage;
  static deserializeBinaryFromReader(message: EmptyMessage, reader: jspb.BinaryReader): EmptyMessage;
}

export namespace EmptyMessage {
  export type AsObject = {
  }
}

