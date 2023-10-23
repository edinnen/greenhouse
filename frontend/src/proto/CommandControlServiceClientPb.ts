/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as commandControl_pb from './commandControl_pb';


export class CommandControlClient {
  client_: grpcWeb.AbstractClientBase;
  hostname_: string;
  credentials_: null | { [index: string]: string; };
  options_: null | { [index: string]: any; };

  constructor (hostname: string,
               credentials?: null | { [index: string]: string; },
               options?: null | { [index: string]: any; }) {
    if (!options) options = {};
    if (!credentials) credentials = {};
    options['format'] = 'text';

    this.client_ = new grpcWeb.GrpcWebClientBase(options);
    this.hostname_ = hostname;
    this.credentials_ = credentials;
    this.options_ = options;
  }

  methodDescriptorLogin = new grpcWeb.MethodDescriptor(
    '/CommandControl/Login',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.LoginRequest,
    commandControl_pb.LoginResponse,
    (request: commandControl_pb.LoginRequest) => {
      return request.serializeBinary();
    },
    commandControl_pb.LoginResponse.deserializeBinary
  );

  login(
    request: commandControl_pb.LoginRequest,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.LoginResponse>;

  login(
    request: commandControl_pb.LoginRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.LoginResponse) => void): grpcWeb.ClientReadableStream<commandControl_pb.LoginResponse>;

  login(
    request: commandControl_pb.LoginRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.LoginResponse) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/Login',
        request,
        metadata || {},
        this.methodDescriptorLogin,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/Login',
    request,
    metadata || {},
    this.methodDescriptorLogin);
  }

  methodDescriptorGetDevices = new grpcWeb.MethodDescriptor(
    '/CommandControl/GetDevices',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.None,
    commandControl_pb.Devices,
    (request: commandControl_pb.None) => {
      return request.serializeBinary();
    },
    commandControl_pb.Devices.deserializeBinary
  );

  getDevices(
    request: commandControl_pb.None,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.Devices>;

  getDevices(
    request: commandControl_pb.None,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.Devices) => void): grpcWeb.ClientReadableStream<commandControl_pb.Devices>;

  getDevices(
    request: commandControl_pb.None,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.Devices) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/GetDevices',
        request,
        metadata || {},
        this.methodDescriptorGetDevices,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/GetDevices',
    request,
    metadata || {},
    this.methodDescriptorGetDevices);
  }

  methodDescriptorUpdateDevice = new grpcWeb.MethodDescriptor(
    '/CommandControl/UpdateDevice',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.Device,
    commandControl_pb.None,
    (request: commandControl_pb.Device) => {
      return request.serializeBinary();
    },
    commandControl_pb.None.deserializeBinary
  );

  updateDevice(
    request: commandControl_pb.Device,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.None>;

  updateDevice(
    request: commandControl_pb.Device,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.None) => void): grpcWeb.ClientReadableStream<commandControl_pb.None>;

  updateDevice(
    request: commandControl_pb.Device,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.None) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/UpdateDevice',
        request,
        metadata || {},
        this.methodDescriptorUpdateDevice,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/UpdateDevice',
    request,
    metadata || {},
    this.methodDescriptorUpdateDevice);
  }

  methodDescriptorCreateZone = new grpcWeb.MethodDescriptor(
    '/CommandControl/CreateZone',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.Zone,
    commandControl_pb.Zones,
    (request: commandControl_pb.Zone) => {
      return request.serializeBinary();
    },
    commandControl_pb.Zones.deserializeBinary
  );

  createZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.Zones>;

  createZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zones) => void): grpcWeb.ClientReadableStream<commandControl_pb.Zones>;

  createZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zones) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/CreateZone',
        request,
        metadata || {},
        this.methodDescriptorCreateZone,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/CreateZone',
    request,
    metadata || {},
    this.methodDescriptorCreateZone);
  }

  methodDescriptorUpdateZone = new grpcWeb.MethodDescriptor(
    '/CommandControl/UpdateZone',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.Zone,
    commandControl_pb.Zone,
    (request: commandControl_pb.Zone) => {
      return request.serializeBinary();
    },
    commandControl_pb.Zone.deserializeBinary
  );

  updateZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.Zone>;

  updateZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zone) => void): grpcWeb.ClientReadableStream<commandControl_pb.Zone>;

  updateZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zone) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/UpdateZone',
        request,
        metadata || {},
        this.methodDescriptorUpdateZone,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/UpdateZone',
    request,
    metadata || {},
    this.methodDescriptorUpdateZone);
  }

  methodDescriptorDeleteZone = new grpcWeb.MethodDescriptor(
    '/CommandControl/DeleteZone',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.Zone,
    commandControl_pb.None,
    (request: commandControl_pb.Zone) => {
      return request.serializeBinary();
    },
    commandControl_pb.None.deserializeBinary
  );

  deleteZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.None>;

  deleteZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.None) => void): grpcWeb.ClientReadableStream<commandControl_pb.None>;

  deleteZone(
    request: commandControl_pb.Zone,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.None) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/DeleteZone',
        request,
        metadata || {},
        this.methodDescriptorDeleteZone,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/DeleteZone',
    request,
    metadata || {},
    this.methodDescriptorDeleteZone);
  }

  methodDescriptorGetZones = new grpcWeb.MethodDescriptor(
    '/CommandControl/GetZones',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.None,
    commandControl_pb.Zones,
    (request: commandControl_pb.None) => {
      return request.serializeBinary();
    },
    commandControl_pb.Zones.deserializeBinary
  );

  getZones(
    request: commandControl_pb.None,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.Zones>;

  getZones(
    request: commandControl_pb.None,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zones) => void): grpcWeb.ClientReadableStream<commandControl_pb.Zones>;

  getZones(
    request: commandControl_pb.None,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zones) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/GetZones',
        request,
        metadata || {},
        this.methodDescriptorGetZones,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/GetZones',
    request,
    metadata || {},
    this.methodDescriptorGetZones);
  }

  methodDescriptorGetZone = new grpcWeb.MethodDescriptor(
    '/CommandControl/GetZone',
    grpcWeb.MethodType.UNARY,
    commandControl_pb.ZoneRequest,
    commandControl_pb.Zone,
    (request: commandControl_pb.ZoneRequest) => {
      return request.serializeBinary();
    },
    commandControl_pb.Zone.deserializeBinary
  );

  getZone(
    request: commandControl_pb.ZoneRequest,
    metadata: grpcWeb.Metadata | null): Promise<commandControl_pb.Zone>;

  getZone(
    request: commandControl_pb.ZoneRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zone) => void): grpcWeb.ClientReadableStream<commandControl_pb.Zone>;

  getZone(
    request: commandControl_pb.ZoneRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: commandControl_pb.Zone) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/CommandControl/GetZone',
        request,
        metadata || {},
        this.methodDescriptorGetZone,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/CommandControl/GetZone',
    request,
    metadata || {},
    this.methodDescriptorGetZone);
  }

}

