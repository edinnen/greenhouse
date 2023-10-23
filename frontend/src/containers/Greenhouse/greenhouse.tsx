import * as grpcWeb from 'grpc-web';
import { GreenhouseClient } from "proto/GreenhouseServiceClientPb";
import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { State, Timeseries, TimeseriesRequest, WaterRequest } from "proto/greenhouse_pb";
import { Zone, ZoneRequest } from 'proto/commandControl_pb';

async function getZone(commandControlClient: CommandControlClient, id: number): Promise<Zone> {
    return new Promise((res, rej) => {
        if (localStorage.getItem('jwt') === null) {
            rej('No JWT');
        }

        const request = new ZoneRequest();
        request.setZone(id);
        commandControlClient.getZone(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Zone) => {
            if (err) {
                return rej(err);
            }
            return res(response)
        });
    });
}

// getState requests the current state of the greenhouse and its sensors
async function getState(greenhouseClient: GreenhouseClient, deviceID: number): Promise<State> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        const request = new State();
        request.setDeviceid(deviceID);

        greenhouseClient.getState(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: State) => {
            if (err) {
                reject(err);
            }

            resolve(response);
        });
    });
}

// setGreenhouseState requests the greenhouse to set to the provided state
async function setGreenhouseState(greenhouseClient: GreenhouseClient, state: State): Promise<State> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        greenhouseClient.setState(state, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: State) => {
            if (err) {
                if (err.message === "invalid token") {
                    localStorage.removeItem('jwt');
                }
                reject(err);
            }

            resolve(response);
        });
    });
}

// getTimeseries requests the timeseries data for the sensors
async function getTimeseries(greenhouseClient: GreenhouseClient, request: TimeseriesRequest): Promise<Timeseries> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        greenhouseClient.getTimeseries(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: Timeseries) => {
            if (err) {
                reject(err);
            }

            resolve(response);
        });
    });
}

// watered sets the greenhouse to the watered state until tomorrow
async function watered(greenhouseClient: GreenhouseClient, request: WaterRequest): Promise<WaterRequest> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        greenhouseClient.watered(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: WaterRequest) => {
            if (err) {
                reject(err);
            }

            resolve(response);
        });
    });
}

export { getState, setGreenhouseState, getTimeseries, watered, getZone };