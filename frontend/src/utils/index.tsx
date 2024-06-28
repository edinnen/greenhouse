import * as grpcWeb from 'grpc-web';
import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { Devices, LoginRequest, LoginResponse, None, Zone, Zones, ZoneRequest, Device } from 'proto/commandControl_pb';
import Greenhouse from 'containers/Greenhouse';
import Irrigation from 'containers/Irrigation';
import Coop from 'containers/Coop';
import { GreenhouseClient } from 'proto/GreenhouseServiceClientPb';
import { IrrigationClient } from 'proto/IrrigationServiceClientPb';
import { CoopClient } from 'proto/CoopServiceClientPb';

export function typeNameFromID(id: number): string {
    switch (id) {
        case 1:
            return 'Greenhouse';
        case 2:
            return 'Irrigation';
        case 3:
            return 'Sensor';
        default:
            return 'Unknown';
    }
}

export function getComponentForDevice(device: Device, commandControlClient: CommandControlClient, greenhouseClient: GreenhouseClient, irrigationClient: IrrigationClient, coopClient: CoopClient): JSX.Element {
    switch (device.getType()) {
        case 1:
            return <Greenhouse greenhouseClient={greenhouseClient} device={device} />;
        case 2:
            return <Irrigation irrigationClient={irrigationClient} device={device} />;
        // case 3:
        //     return <Sensor device={device} />;
        case 4:
            return <Coop coopClient={coopClient} device={device} />;
        default:
            return <div>Unknown device type</div>;
    }
}

// login checks the password and returns a JWT if successful
export async function login(commandControlClient: CommandControlClient, password: string): Promise<LoginResponse> {
    return new Promise((res, rej) => {
        const request = new LoginRequest();
        request.setPassword(password);
        commandControlClient.login(request, {}, (err: grpcWeb.RpcError, response: LoginResponse) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}

export async function getZones(commandControlClient: CommandControlClient): Promise<Zones> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            window.location.href = "/login";
            rej('No JWT');
        }

        const request = new None();
        commandControlClient.getZones(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Zones) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}

export async function getZone(commandControlClient: CommandControlClient, id: number): Promise<Zone> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            window.location.href = "/login";
            rej('No JWT');
        }

        const request = new ZoneRequest();
        request.setZone(id);
        commandControlClient.getZone(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Zone) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}

export async function createZone(commandControlClient: CommandControlClient, zone: Zone): Promise<Zones> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            window.location.href = "/login";
            rej('No JWT');
        }

        commandControlClient.createZone(zone, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Zones) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}

export async function getDevices(commandControlClient: CommandControlClient): Promise<Devices> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            window.location.href = "/login";
            rej('No JWT');
        }

        const request = new None();
        commandControlClient.getDevices(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Devices) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}

export async function updateDevice(commandControlClient: CommandControlClient, device: Device): Promise<None> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            window.location.href = "/login";
            rej('No JWT');
        }

        commandControlClient.updateDevice(device, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: None) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}

export async function updateZone(commandControlClient: CommandControlClient, zone: Zone): Promise<Zone> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            window.location.href = "/login";
            rej('No JWT');
        }

        commandControlClient.updateZone(zone, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Zone) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                    window.location.href = "/login";
                }
                return rej(err);
            }
            return res(response)
        });
    });
}