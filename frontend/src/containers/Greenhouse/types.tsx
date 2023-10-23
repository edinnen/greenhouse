import { Timing } from "proto/greenhouse_pb"

export type PlotData = {
    time: string,
    temperature: number,
    humidity: number,
    soilCapacitance: number,
    brightness: number,
}

export interface StateChangeProps {
    lights?: boolean;
    brightnessAll?: number | Array<number>;
    brightnessPercent1?: number | Array<number>;
    brightnessPercent2?: number | Array<number>;
    wateredToday?: boolean;
    lightsTiming?: Timing;
    recirculationFan?: boolean;
    ventFan?: boolean;
    ventOverridden?: boolean;
    lightsOverridden?: boolean;
    rampPercentage?: number | Array<number>;
    maxAutomationBrightness?: number | Array<number>;
}