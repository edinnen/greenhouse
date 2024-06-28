import * as grpcWeb from 'grpc-web';
import { CoopClient } from "proto/CoopServiceClientPb";
import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { CoopState, CoopTimeseries, CoopTimeseriesRequest, CoopWaterRequest } from "proto/coop_pb";
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

// getState requests the current state of the coop and its sensors
async function getCoopState(coopClient: CoopClient, deviceID: number): Promise<CoopState> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        const request = new CoopState();
        request.setDeviceid(deviceID);

        coopClient.getCoopState(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: CoopState) => {
            if (err) {
                reject(err);
            }

            resolve(response);
        });
    });
}

// setCoopState requests the coop to set to the provided state
async function setCoopState(coopClient: CoopClient, state: CoopState): Promise<CoopState> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        coopClient.setCoopState(state, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: CoopState) => {
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

// getCoopTimeseries requests the timeseries data for the sensors
async function getCoopTimeseries(coopClient: CoopClient, request: CoopTimeseriesRequest): Promise<CoopTimeseries> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        coopClient.getCoopTimeseries(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: CoopTimeseries) => {
            if (err) {
                reject(err);
            }

            resolve(response);
        });
    });
}

// watered sets the coop to the watered state until tomorrow
async function coopWatered(coopClient: CoopClient, request: CoopWaterRequest): Promise<CoopWaterRequest> {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('jwt') === null) {
            reject('No JWT');
        }

        coopClient.coopWatered(request, { "authorization": localStorage.getItem('jwt') || "" }, (err: grpcWeb.RpcError, response: CoopWaterRequest) => {
            if (err) {
                reject(err);
            }

            resolve(response);
        });
    });
}

export { getCoopState, setCoopState, getCoopTimeseries, coopWatered, getZone };