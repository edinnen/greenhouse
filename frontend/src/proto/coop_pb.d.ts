import * as jspb from 'google-protobuf'



export class CoopState extends jspb.Message {
  getLights(): boolean;
  setLights(value: boolean): CoopState;

  getBrightness(): number;
  setBrightness(value: number): CoopState;

  getRed(): number;
  setRed(value: number): CoopState;

  getGreen(): number;
  setGreen(value: number): CoopState;

  getBlue(): number;
  setBlue(value: number): CoopState;

  getWhite(): number;
  setWhite(value: number): CoopState;

  getLightslast(): number;
  setLightslast(value: number): CoopState;

  getTemperature(): number;
  setTemperature(value: number): CoopState;

  getHumidity(): number;
  setHumidity(value: number): CoopState;

  getGateposition(): number;
  setGateposition(value: number): CoopState;

  getTimestamp(): number;
  setTimestamp(value: number): CoopState;

  getWateredtoday(): boolean;
  setWateredtoday(value: boolean): CoopState;

  getLightstiming(): CoopTiming | undefined;
  setLightstiming(value?: CoopTiming): CoopState;
  hasLightstiming(): boolean;
  clearLightstiming(): CoopState;

  getRecirculationfan(): boolean;
  setRecirculationfan(value: boolean): CoopState;

  getRecirculationfanlast(): number;
  setRecirculationfanlast(value: number): CoopState;

  getVentfan(): boolean;
  setVentfan(value: boolean): CoopState;

  getVentfanlast(): number;
  setVentfanlast(value: number): CoopState;

  getVentoverridden(): boolean;
  setVentoverridden(value: boolean): CoopState;

  getWateredlast(): number;
  setWateredlast(value: number): CoopState;

  getLightsoverridden(): boolean;
  setLightsoverridden(value: boolean): CoopState;

  getRamppercentage(): number;
  setRamppercentage(value: number): CoopState;

  getMaxautomationbrightness(): number;
  setMaxautomationbrightness(value: number): CoopState;

  getDeviceid(): number;
  setDeviceid(value: number): CoopState;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoopState.AsObject;
  static toObject(includeInstance: boolean, msg: CoopState): CoopState.AsObject;
  static serializeBinaryToWriter(message: CoopState, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoopState;
  static deserializeBinaryFromReader(message: CoopState, reader: jspb.BinaryReader): CoopState;
}

export namespace CoopState {
  export type AsObject = {
    lights: boolean,
    brightness: number,
    red: number,
    green: number,
    blue: number,
    white: number,
    lightslast: number,
    temperature: number,
    humidity: number,
    gateposition: number,
    timestamp: number,
    wateredtoday: boolean,
    lightstiming?: CoopTiming.AsObject,
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

export class CoopTiming extends jspb.Message {
  getStart(): CoopTimestamp | undefined;
  setStart(value?: CoopTimestamp): CoopTiming;
  hasStart(): boolean;
  clearStart(): CoopTiming;

  getEnd(): CoopTimestamp | undefined;
  setEnd(value?: CoopTimestamp): CoopTiming;
  hasEnd(): boolean;
  clearEnd(): CoopTiming;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoopTiming.AsObject;
  static toObject(includeInstance: boolean, msg: CoopTiming): CoopTiming.AsObject;
  static serializeBinaryToWriter(message: CoopTiming, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoopTiming;
  static deserializeBinaryFromReader(message: CoopTiming, reader: jspb.BinaryReader): CoopTiming;
}

export namespace CoopTiming {
  export type AsObject = {
    start?: CoopTimestamp.AsObject,
    end?: CoopTimestamp.AsObject,
  }
}

export class CoopTimestamp extends jspb.Message {
  getSeconds(): number;
  setSeconds(value: number): CoopTimestamp;

  getNanos(): number;
  setNanos(value: number): CoopTimestamp;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoopTimestamp.AsObject;
  static toObject(includeInstance: boolean, msg: CoopTimestamp): CoopTimestamp.AsObject;
  static serializeBinaryToWriter(message: CoopTimestamp, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoopTimestamp;
  static deserializeBinaryFromReader(message: CoopTimestamp, reader: jspb.BinaryReader): CoopTimestamp;
}

export namespace CoopTimestamp {
  export type AsObject = {
    seconds: number,
    nanos: number,
  }
}

export class CoopTimeseries extends jspb.Message {
  getStatesList(): Array<CoopState>;
  setStatesList(value: Array<CoopState>): CoopTimeseries;
  clearStatesList(): CoopTimeseries;
  addStates(value?: CoopState, index?: number): CoopState;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoopTimeseries.AsObject;
  static toObject(includeInstance: boolean, msg: CoopTimeseries): CoopTimeseries.AsObject;
  static serializeBinaryToWriter(message: CoopTimeseries, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoopTimeseries;
  static deserializeBinaryFromReader(message: CoopTimeseries, reader: jspb.BinaryReader): CoopTimeseries;
}

export namespace CoopTimeseries {
  export type AsObject = {
    statesList: Array<CoopState.AsObject>,
  }
}

export class CoopTimeseriesRequest extends jspb.Message {
  getFrom(): number;
  setFrom(value: number): CoopTimeseriesRequest;

  getTo(): number;
  setTo(value: number): CoopTimeseriesRequest;

  getDeviceid(): number;
  setDeviceid(value: number): CoopTimeseriesRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoopTimeseriesRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CoopTimeseriesRequest): CoopTimeseriesRequest.AsObject;
  static serializeBinaryToWriter(message: CoopTimeseriesRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoopTimeseriesRequest;
  static deserializeBinaryFromReader(message: CoopTimeseriesRequest, reader: jspb.BinaryReader): CoopTimeseriesRequest;
}

export namespace CoopTimeseriesRequest {
  export type AsObject = {
    from: number,
    to: number,
    deviceid: number,
  }
}

export class CoopWaterRequest extends jspb.Message {
  getDeviceid(): number;
  setDeviceid(value: number): CoopWaterRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoopWaterRequest.AsObject;
  static toObject(includeInstance: boolean, msg: CoopWaterRequest): CoopWaterRequest.AsObject;
  static serializeBinaryToWriter(message: CoopWaterRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoopWaterRequest;
  static deserializeBinaryFromReader(message: CoopWaterRequest, reader: jspb.BinaryReader): CoopWaterRequest;
}

export namespace CoopWaterRequest {
  export type AsObject = {
    deviceid: number,
  }
}

