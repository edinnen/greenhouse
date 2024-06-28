// Code generated by protoc-gen-go-grpc. DO NOT EDIT.
// versions:
// - protoc-gen-go-grpc v1.4.0
// - protoc             v5.27.1
// source: coop.proto

package pb

import (
	context "context"
	grpc "google.golang.org/grpc"
	codes "google.golang.org/grpc/codes"
	status "google.golang.org/grpc/status"
)

// This is a compile-time assertion to ensure that this generated file
// is compatible with the grpc package it is being compiled against.
// Requires gRPC-Go v1.62.0 or later.
const _ = grpc.SupportPackageIsVersion8

const (
	Coop_GetCoopState_FullMethodName      = "/Coop/GetCoopState"
	Coop_SetCoopState_FullMethodName      = "/Coop/SetCoopState"
	Coop_CoopWatered_FullMethodName       = "/Coop/CoopWatered"
	Coop_GetCoopTimeseries_FullMethodName = "/Coop/GetCoopTimeseries"
)

// CoopClient is the client API for Coop service.
//
// For semantics around ctx use and closing/ending streaming RPCs, please refer to https://pkg.go.dev/google.golang.org/grpc/?tab=doc#ClientConn.NewStream.
type CoopClient interface {
	GetCoopState(ctx context.Context, in *CoopState, opts ...grpc.CallOption) (*CoopState, error)
	SetCoopState(ctx context.Context, in *CoopState, opts ...grpc.CallOption) (*CoopState, error)
	CoopWatered(ctx context.Context, in *CoopWaterRequest, opts ...grpc.CallOption) (*CoopWaterRequest, error)
	GetCoopTimeseries(ctx context.Context, in *CoopTimeseriesRequest, opts ...grpc.CallOption) (*CoopTimeseries, error)
}

type coopClient struct {
	cc grpc.ClientConnInterface
}

func NewCoopClient(cc grpc.ClientConnInterface) CoopClient {
	return &coopClient{cc}
}

func (c *coopClient) GetCoopState(ctx context.Context, in *CoopState, opts ...grpc.CallOption) (*CoopState, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(CoopState)
	err := c.cc.Invoke(ctx, Coop_GetCoopState_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *coopClient) SetCoopState(ctx context.Context, in *CoopState, opts ...grpc.CallOption) (*CoopState, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(CoopState)
	err := c.cc.Invoke(ctx, Coop_SetCoopState_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *coopClient) CoopWatered(ctx context.Context, in *CoopWaterRequest, opts ...grpc.CallOption) (*CoopWaterRequest, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(CoopWaterRequest)
	err := c.cc.Invoke(ctx, Coop_CoopWatered_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

func (c *coopClient) GetCoopTimeseries(ctx context.Context, in *CoopTimeseriesRequest, opts ...grpc.CallOption) (*CoopTimeseries, error) {
	cOpts := append([]grpc.CallOption{grpc.StaticMethod()}, opts...)
	out := new(CoopTimeseries)
	err := c.cc.Invoke(ctx, Coop_GetCoopTimeseries_FullMethodName, in, out, cOpts...)
	if err != nil {
		return nil, err
	}
	return out, nil
}

// CoopServer is the server API for Coop service.
// All implementations must embed UnimplementedCoopServer
// for forward compatibility
type CoopServer interface {
	GetCoopState(context.Context, *CoopState) (*CoopState, error)
	SetCoopState(context.Context, *CoopState) (*CoopState, error)
	CoopWatered(context.Context, *CoopWaterRequest) (*CoopWaterRequest, error)
	GetCoopTimeseries(context.Context, *CoopTimeseriesRequest) (*CoopTimeseries, error)
	mustEmbedUnimplementedCoopServer()
}

// UnimplementedCoopServer must be embedded to have forward compatible implementations.
type UnimplementedCoopServer struct {
}

func (UnimplementedCoopServer) GetCoopState(context.Context, *CoopState) (*CoopState, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetCoopState not implemented")
}
func (UnimplementedCoopServer) SetCoopState(context.Context, *CoopState) (*CoopState, error) {
	return nil, status.Errorf(codes.Unimplemented, "method SetCoopState not implemented")
}
func (UnimplementedCoopServer) CoopWatered(context.Context, *CoopWaterRequest) (*CoopWaterRequest, error) {
	return nil, status.Errorf(codes.Unimplemented, "method CoopWatered not implemented")
}
func (UnimplementedCoopServer) GetCoopTimeseries(context.Context, *CoopTimeseriesRequest) (*CoopTimeseries, error) {
	return nil, status.Errorf(codes.Unimplemented, "method GetCoopTimeseries not implemented")
}
func (UnimplementedCoopServer) mustEmbedUnimplementedCoopServer() {}

// UnsafeCoopServer may be embedded to opt out of forward compatibility for this service.
// Use of this interface is not recommended, as added methods to CoopServer will
// result in compilation errors.
type UnsafeCoopServer interface {
	mustEmbedUnimplementedCoopServer()
}

func RegisterCoopServer(s grpc.ServiceRegistrar, srv CoopServer) {
	s.RegisterService(&Coop_ServiceDesc, srv)
}

func _Coop_GetCoopState_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CoopState)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(CoopServer).GetCoopState(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: Coop_GetCoopState_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(CoopServer).GetCoopState(ctx, req.(*CoopState))
	}
	return interceptor(ctx, in, info, handler)
}

func _Coop_SetCoopState_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CoopState)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(CoopServer).SetCoopState(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: Coop_SetCoopState_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(CoopServer).SetCoopState(ctx, req.(*CoopState))
	}
	return interceptor(ctx, in, info, handler)
}

func _Coop_CoopWatered_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CoopWaterRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(CoopServer).CoopWatered(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: Coop_CoopWatered_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(CoopServer).CoopWatered(ctx, req.(*CoopWaterRequest))
	}
	return interceptor(ctx, in, info, handler)
}

func _Coop_GetCoopTimeseries_Handler(srv interface{}, ctx context.Context, dec func(interface{}) error, interceptor grpc.UnaryServerInterceptor) (interface{}, error) {
	in := new(CoopTimeseriesRequest)
	if err := dec(in); err != nil {
		return nil, err
	}
	if interceptor == nil {
		return srv.(CoopServer).GetCoopTimeseries(ctx, in)
	}
	info := &grpc.UnaryServerInfo{
		Server:     srv,
		FullMethod: Coop_GetCoopTimeseries_FullMethodName,
	}
	handler := func(ctx context.Context, req interface{}) (interface{}, error) {
		return srv.(CoopServer).GetCoopTimeseries(ctx, req.(*CoopTimeseriesRequest))
	}
	return interceptor(ctx, in, info, handler)
}

// Coop_ServiceDesc is the grpc.ServiceDesc for Coop service.
// It's only intended for direct use with grpc.RegisterService,
// and not to be introspected or modified (even as a copy)
var Coop_ServiceDesc = grpc.ServiceDesc{
	ServiceName: "Coop",
	HandlerType: (*CoopServer)(nil),
	Methods: []grpc.MethodDesc{
		{
			MethodName: "GetCoopState",
			Handler:    _Coop_GetCoopState_Handler,
		},
		{
			MethodName: "SetCoopState",
			Handler:    _Coop_SetCoopState_Handler,
		},
		{
			MethodName: "CoopWatered",
			Handler:    _Coop_CoopWatered_Handler,
		},
		{
			MethodName: "GetCoopTimeseries",
			Handler:    _Coop_GetCoopTimeseries_Handler,
		},
	},
	Streams:  []grpc.StreamDesc{},
	Metadata: "coop.proto",
}
