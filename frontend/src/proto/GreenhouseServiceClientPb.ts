/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as greenhouse_pb from './greenhouse_pb';


export class GreenhouseClient {
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

  methodDescriptorGetState = new grpcWeb.MethodDescriptor(
    '/Greenhouse/GetState',
    grpcWeb.MethodType.UNARY,
    greenhouse_pb.State,
    greenhouse_pb.State,
    (request: greenhouse_pb.State) => {
      return request.serializeBinary();
    },
    greenhouse_pb.State.deserializeBinary
  );

  getState(
    request: greenhouse_pb.State,
    metadata: grpcWeb.Metadata | null): Promise<greenhouse_pb.State>;

  getState(
    request: greenhouse_pb.State,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: greenhouse_pb.State) => void): grpcWeb.ClientReadableStream<greenhouse_pb.State>;

  getState(
    request: greenhouse_pb.State,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: greenhouse_pb.State) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/Greenhouse/GetState',
        request,
        metadata || {},
        this.methodDescriptorGetState,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/Greenhouse/GetState',
    request,
    metadata || {},
    this.methodDescriptorGetState);
  }

  methodDescriptorSetState = new grpcWeb.MethodDescriptor(
    '/Greenhouse/SetState',
    grpcWeb.MethodType.UNARY,
    greenhouse_pb.State,
    greenhouse_pb.State,
    (request: greenhouse_pb.State) => {
      return request.serializeBinary();
    },
    greenhouse_pb.State.deserializeBinary
  );

  setState(
    request: greenhouse_pb.State,
    metadata: grpcWeb.Metadata | null): Promise<greenhouse_pb.State>;

  setState(
    request: greenhouse_pb.State,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: greenhouse_pb.State) => void): grpcWeb.ClientReadableStream<greenhouse_pb.State>;

  setState(
    request: greenhouse_pb.State,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: greenhouse_pb.State) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/Greenhouse/SetState',
        request,
        metadata || {},
        this.methodDescriptorSetState,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/Greenhouse/SetState',
    request,
    metadata || {},
    this.methodDescriptorSetState);
  }

  methodDescriptorWatered = new grpcWeb.MethodDescriptor(
    '/Greenhouse/Watered',
    grpcWeb.MethodType.UNARY,
    greenhouse_pb.WaterRequest,
    greenhouse_pb.WaterRequest,
    (request: greenhouse_pb.WaterRequest) => {
      return request.serializeBinary();
    },
    greenhouse_pb.WaterRequest.deserializeBinary
  );

  watered(
    request: greenhouse_pb.WaterRequest,
    metadata: grpcWeb.Metadata | null): Promise<greenhouse_pb.WaterRequest>;

  watered(
    request: greenhouse_pb.WaterRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: greenhouse_pb.WaterRequest) => void): grpcWeb.ClientReadableStream<greenhouse_pb.WaterRequest>;

  watered(
    request: greenhouse_pb.WaterRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: greenhouse_pb.WaterRequest) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/Greenhouse/Watered',
        request,
        metadata || {},
        this.methodDescriptorWatered,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/Greenhouse/Watered',
    request,
    metadata || {},
    this.methodDescriptorWatered);
  }

  methodDescriptorGetTimeseries = new grpcWeb.MethodDescriptor(
    '/Greenhouse/GetTimeseries',
    grpcWeb.MethodType.UNARY,
    greenhouse_pb.TimeseriesRequest,
    greenhouse_pb.Timeseries,
    (request: greenhouse_pb.TimeseriesRequest) => {
      return request.serializeBinary();
    },
    greenhouse_pb.Timeseries.deserializeBinary
  );

  getTimeseries(
    request: greenhouse_pb.TimeseriesRequest,
    metadata: grpcWeb.Metadata | null): Promise<greenhouse_pb.Timeseries>;

  getTimeseries(
    request: greenhouse_pb.TimeseriesRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: greenhouse_pb.Timeseries) => void): grpcWeb.ClientReadableStream<greenhouse_pb.Timeseries>;

  getTimeseries(
    request: greenhouse_pb.TimeseriesRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: greenhouse_pb.Timeseries) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/Greenhouse/GetTimeseries',
        request,
        metadata || {},
        this.methodDescriptorGetTimeseries,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/Greenhouse/GetTimeseries',
    request,
    metadata || {},
    this.methodDescriptorGetTimeseries);
  }

}

