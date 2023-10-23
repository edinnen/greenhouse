import * as jspb from 'google-protobuf'



export class State extends jspb.Message {
  getLights(): boolean;
  setLights(value: boolean): State;

  getBrightnesspercent1(): number;
  setBrightnesspercent1(value: number): State;

  getBrightnesspercent2(): number;
  setBrightnesspercent2(value: number): State;

  getLightslast(): number;
  setLightslast(value: number): State;

  getTemperature(): number;
  setTemperature(value: number): State;

  getHumidity(): number;
  setHumidity(value: number): State;

  getSoilcapacitance(): number;
  setSoilcapacitance(value: number): State;

  getTimestamp(): number;
  setTimestamp(value: number): State;

  getWateredtoday(): boolean;
  setWateredtoday(value: boolean): State;

  getLightstiming(): Timing | undefined;
  setLightstiming(value?: Timing): State;
  hasLightstiming(): boolean;
  clearLightstiming(): State;

  getRecirculationfan(): boolean;
  setRecirculationfan(value: boolean): State;

  getRecirculationfanlast(): number;
  setRecirculationfanlast(value: number): State;

  getVentfan(): boolean;
  setVentfan(value: boolean): State;

  getVentfanlast(): number;
  setVentfanlast(value: number): State;

  getVentoverridden(): boolean;
  setVentoverridden(value: boolean): State;

  getWateredlast(): number;
  setWateredlast(value: number): State;

  getLightsoverridden(): boolean;
  setLightsoverridden(value: boolean): State;

  getRamppercentage(): number;
  setRamppercentage(value: number): State;

  getMaxautomationbrightness(): number;
  setMaxautomationbrightness(value: number): State;

  getDeviceid(): number;
  setDeviceid(value: number): State;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): State.AsObject;
  static toObject(includeInstance: boolean, msg: State): State.AsObject;
  static serializeBinaryToWriter(message: State, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): State;
  static deserializeBinaryFromReader(message: State, reader: jspb.BinaryReader): State;
}

export namespace State {
  export type AsObject = {
    lights: boolean,
    brightnesspercent1: number,
    brightnesspercent2: number,
    lightslast: number,
    temperature: number,
    humidity: number,
    soilcapacitance: number,
    timestamp: number,
    wateredtoday: boolean,
    lightstiming?: Timing.AsObject,
    recirculationfan: boolean,
    recirculationfanlast: number,
    ventfan: boolean,
    ventfanlast: number,
    ventoverridden: boolean,
    wateredlast: number,
    lightsoverridden: boolean,
    ramppercentage: number,
    maxautomationbrightness: number,
    deviceid: number,
  }
}

export class Timing extends jspb.Message {
  getStart(): Timestamp | undefined;
  setStart(value?: Timestamp): Timing;
  hasStart(): boolean;
  clearStart(): Timing;

  getEnd(): Timestamp | undefined;
  setEnd(value?: Timestamp): Timing;
  hasEnd(): boolean;
  clearEnd(): Timing;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Timing.AsObject;
  static toObject(includeInstance: boolean, msg: Timing): Timing.AsObject;
  static serializeBinaryToWriter(message: Timing, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Timing;
  static deserializeBinaryFromReader(message: Timing, reader: jspb.BinaryReader): Timing;
}

export namespace Timing {
  export type AsObject = {
    start?: Timestamp.AsObject,
    end?: Timestamp.AsObject,
  }
}

export class Timestamp extends jspb.Message {
  getSeconds(): number;
  setSeconds(value: number): Timestamp;

  getNanos(): number;
  setNanos(value: number): Timestamp;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Timestamp.AsObject;
  static toObject(includeInstance: boolean, msg: Timestamp): Timestamp.AsObject;
  static serializeBinaryToWriter(message: Timestamp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Timestamp;
  static deserializeBinaryFromReader(message: Timestamp, reader: jspb.BinaryReader): Timestamp;
}

export namespace Timestamp {
  export type AsObject = {
    seconds: number,
    nanos: number,
  }
}

export class Timeseries extends jspb.Message {
  getStatesList(): Array<State>;
  setStatesList(value: Array<State>): Timeseries;
  clearStatesList(): Timeseries;
  addStates(value?: State, index?: number): State;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Timeseries.AsObject;
  static toObject(includeInstance: boolean, msg: Timeseries): Timeseries.AsObject;
  static serializeBinaryToWriter(message: Timeseries, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Timeseries;
  static deserializeBinaryFromReader(message: Timeseries, reader: jspb.BinaryReader): Timeseries;
}

export namespace Timeseries {
  export type AsObject = {
    statesList: Array<State.AsObject>,
  }
}

export class TimeseriesRequest extends jspb.Message {
  getFrom(): number;
  setFrom(value: number): TimeseriesRequest;

  getTo(): number;
  setTo(value: number): TimeseriesRequest;

  getDeviceid(): number;
  setDeviceid(value: number): TimeseriesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): TimeseriesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: TimeseriesRequest): TimeseriesRequest.AsObject;
  static serializeBinaryToWriter(message: TimeseriesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): TimeseriesRequest;
  static deserializeBinaryFromReader(message: TimeseriesRequest, reader: jspb.BinaryReader): TimeseriesRequest;
}

export namespace TimeseriesRequest {
  export type AsObject = {
    from: number,
    to: number,
    deviceid: number,
  }
}

export class WaterRequest extends jspb.Message {
  getDeviceid(): number;
  setDeviceid(value: number): WaterRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): WaterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: WaterRequest): WaterRequest.AsObject;
  static serializeBinaryToWriter(message: WaterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): WaterRequest;
  static deserializeBinaryFromReader(message: WaterRequest, reader: jspb.BinaryReader): WaterRequest;
}

export namespace WaterRequest {
  export type AsObject = {
    deviceid: number,
  }
}

