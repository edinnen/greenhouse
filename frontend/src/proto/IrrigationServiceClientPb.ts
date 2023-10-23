/**
 * @fileoverview gRPC-Web generated client stub for 
 * @enhanceable
 * @public
 */

// GENERATED CODE -- DO NOT EDIT!


/* eslint-disable */
// @ts-nocheck


import * as grpcWeb from 'grpc-web';

import * as irrigation_pb from './irrigation_pb';


export class IrrigationClient {
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
    '/Irrigation/GetState',
    grpcWeb.MethodType.UNARY,
    irrigation_pb.IrrigationRequest,
    irrigation_pb.Irrigator,
    (request: irrigation_pb.IrrigationRequest) => {
      return request.serializeBinary();
    },
    irrigation_pb.Irrigator.deserializeBinary
  );

  getState(
    request: irrigation_pb.IrrigationRequest,
    metadata: grpcWeb.Metadata | null): Promise<irrigation_pb.Irrigator>;

  getState(
    request: irrigation_pb.IrrigationRequest,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: irrigation_pb.Irrigator) => void): grpcWeb.ClientReadableStream<irrigation_pb.Irrigator>;

  getState(
    request: irrigation_pb.IrrigationRequest,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: irrigation_pb.Irrigator) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/Irrigation/GetState',
        request,
        metadata || {},
        this.methodDescriptorGetState,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/Irrigation/GetState',
    request,
    metadata || {},
    this.methodDescriptorGetState);
  }

  methodDescriptorSetState = new grpcWeb.MethodDescriptor(
    '/Irrigation/SetState',
    grpcWeb.MethodType.UNARY,
    irrigation_pb.Irrigator,
    irrigation_pb.Irrigator,
    (request: irrigation_pb.Irrigator) => {
      return request.serializeBinary();
    },
    irrigation_pb.Irrigator.deserializeBinary
  );

  setState(
    request: irrigation_pb.Irrigator,
    metadata: grpcWeb.Metadata | null): Promise<irrigation_pb.Irrigator>;

  setState(
    request: irrigation_pb.Irrigator,
    metadata: grpcWeb.Metadata | null,
    callback: (err: grpcWeb.RpcError,
               response: irrigation_pb.Irrigator) => void): grpcWeb.ClientReadableStream<irrigation_pb.Irrigator>;

  setState(
    request: irrigation_pb.Irrigator,
    metadata: grpcWeb.Metadata | null,
    callback?: (err: grpcWeb.RpcError,
               response: irrigation_pb.Irrigator) => void) {
    if (callback !== undefined) {
      return this.client_.rpcCall(
        this.hostname_ +
          '/Irrigation/SetState',
        request,
        metadata || {},
        this.methodDescriptorSetState,
        callback);
    }
    return this.client_.unaryCall(
    this.hostname_ +
      '/Irrigation/SetState',
    request,
    metadata || {},
    this.methodDescriptorSetState);
  }

}

