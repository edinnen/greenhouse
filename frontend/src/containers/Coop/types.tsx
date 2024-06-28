import { CoopTiming } from "proto/coop_pb"

export type PlotData = {
    time: string,
    temperature: number,
    humidity: number,
    brightness: number,
}

export interface StateChangeProps {
    lights?: boolean;
    brightness?: number | Array<number>;
    wateredToday?: boolean;
    lightsTiming?: CoopTiming;
    recirculationFan?: boolean;
    ventFan?: boolean;
    ventOverridden?: boolean;
    lightsOverridden?: boolean;
    rampPercentage?: number | Array<number>;
    maxAutomationBrightness?: number | Array<number>;
    color?: Array<number>;
}