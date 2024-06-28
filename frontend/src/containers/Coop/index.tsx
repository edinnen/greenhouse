import { useState, useEffect } from 'react';
import { Container, Grid, Button, FormControl, MenuItem, InputLabel, Typography, TextField } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import { Timer, Guage, Value, Switch, LinePlot, Slider, StatusLight, Copyright } from "../../components";
import { CoopState, CoopTimeseries, CoopTimeseriesRequest, CoopTiming, CoopWaterRequest } from '../../proto/coop_pb';
import { CoopClient } from '../../proto/CoopServiceClientPb';
import { getCoopState, setCoopState, getCoopTimeseries, coopWatered } from './coop';
import { PlotData, StateChangeProps } from './types';
import moment from 'moment';
import { ColorPicker } from 'material-ui-color';
import { Device } from 'proto/commandControl_pb';

type CoopProps = {
    coopClient: CoopClient;
    device: Device;
};

export default function Coop({ coopClient, device }: CoopProps) {
  const [state, setState] = useState(new CoopState());
  const [plotData, setPlotData] = useState([] as PlotData[]);
  const [timeseriesInterrupt, setTimeseriesInterrupt] = useState(false);
  const [timeseries, setTimeseries] = useState(false);
  const [timePeriod, setTimePeriod] = useState("");
  const [modificationsDisabled, setModificationsDisabled] = useState(true);

  // Fetch the state of the coop once on mount
  useEffect(() => {
    const currentJwt = localStorage.getItem('jwt') || "";
    if (!currentJwt) {
      window.location.href = "/login";
      return;
    };
    // Set jwt cookie
    document.cookie = `jwt=${currentJwt}`;

    if (!device) return;
    if (state.getDeviceid() <= 0) state.setDeviceid(device.getId());

    getCoopState(coopClient, state.getDeviceid()).then((newState: CoopState) => {
      // Update the plotData if user has not requested a specific timeseries
      let newData: PlotData[] = [...plotData];
      if (plotData.length >= 50) {
        newData = plotData.slice(1);
      }
      newData.push({
        time: new Date(newState.getTimestamp() * 1000).toLocaleTimeString(),
        temperature: newState.getTemperature(),
        humidity: newState.getHumidity(),
        brightness: newState.getBrightness(),
      });
      setPlotData(newData);

      if (!newState.hasLightstiming()) {
        newState.setLightstiming(new CoopTiming());
      }

      newState.setDeviceid(device?.getId() || 0);

      // Set the state
      setState(newState);
      setModificationsDisabled(false);
      return () => {};
    }).catch((err: { message: string; }) => {
      if (err.message === "invalid token") {
          localStorage.removeItem('jwt');
          window.location.href = "/login";
          return;
      }
      console.log(err);
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch the coop state periodically in the background
  useEffect(() => {
    const timeoutID = setTimeout(async () => {
      try {
        let newData: PlotData[] = [...plotData];
        const newState = await getCoopState(coopClient, state.getDeviceid());
        // Update the plotData if user has not requested a specific timeseries
        if (!timeseries) {
          if (plotData.length >= 120) {
            newData = plotData.slice(1);
          }
          newData.push({
            time: new Date(newState.getTimestamp() * 1000).toLocaleTimeString(),
            temperature: newState.getTemperature(),
            humidity: newState.getHumidity(),
            brightness: newState.getBrightness(),
          });
          setPlotData(newData);
        }
        if (!newState.hasLightstiming()) {
          newState.setLightstiming(new CoopTiming());
        }
        setState(newState);
        setModificationsDisabled(false);
        setTimeseriesInterrupt(false);
      } catch (err: any) {
        if (err.message === "invalid token") {
            localStorage.removeItem('jwt');
            window.location.href = "/login";
            return;
        }
        console.log(err);
      }
    }, 5 * 1000);

    return () => {
      clearTimeout(timeoutID);
    }
  }, [state, timeseries]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update any the state dynamically based on the provided props
  const updateCoop = async (toChange: StateChangeProps) => {
    // Ensure we don't send updates while the previous update is still processing

    if (modificationsDisabled) return;

    setModificationsDisabled(true);
    const newState = state;

    Object.keys(toChange).forEach((key: string) => {
      switch (key) {
        case "recirculationFan":
          newState.setRecirculationfan(toChange[key] ?? false);
          break;
        case "ventFan":
          newState.setVentfan(toChange[key] || false);
          break;
        case "ventOverridden":
          newState.setVentoverridden(toChange[key] || false);
          break;
        case "lightsOverridden":
          newState.setLightsoverridden(toChange[key] || false);
          break;
        case "lights":
          newState.setLights(toChange[key] || false);
          break;
        case "brightness":
          if (toChange[key] as number >= 10 && !state.getLights()) newState.setLights(true);
          newState.setBrightness(toChange[key] as number);
          break;
        case "lightsTiming":
          newState.setLightstiming(toChange[key] || new CoopTiming());
          break;
        case "rampPercentage":
          newState.setRamppercentage(toChange[key] as number);
          break;
        case "maxAutomationBrightness":
          newState.setMaxautomationbrightness(toChange[key] as number);
          break;
        case "color":
          const rgbw = toChange[key] as Array<number>;
          newState.setRed(rgbw[0]);
          newState.setGreen(rgbw[1]);
          newState.setBlue(rgbw[2]);
          newState.setWhite(rgbw[3]);
          break;
        default:
          break;
      }
    });

    try {
      if (toChange.wateredToday) {
        newState.setWateredtoday(true);
        const waterRequest = new CoopWaterRequest();
        waterRequest.setDeviceid(state.getDeviceid());
        await coopWatered(coopClient, waterRequest);
      }
      const updatedState = await setCoopState(coopClient, newState);
      setState(updatedState);
      setModificationsDisabled(false);
    } catch (err: any) {
      if (err.message === "invalid token") {
          localStorage.removeItem('jwt');
          window.location.href = "/login";
          return;
      }
      console.log(err);
    }
  };

  // fetchTimeseries fetches the timeseries data from the coop
  const fetchTimeseries = () => {
    setTimeseries(true);
    setTimeseriesInterrupt(true);
    setModificationsDisabled(true);
    const request = new CoopTimeseriesRequest();

    const timeInSeconds = parseInt(timePeriod, 10);
    const from = moment().unix() - timeInSeconds;
    const to = moment().unix();
    request.setFrom(from);
    request.setTo(to);
    request.setDeviceid(state.getDeviceid());

    while (timeseriesInterrupt) continue; // Don't continue until background fetch is complete

    getCoopTimeseries(coopClient, request).then((response: CoopTimeseries) => {
      const newPlotData: PlotData[] = [];
      response.getStatesList().forEach((state: CoopState) => {
        newPlotData.push({
          time: new Date(state.getTimestamp() * 1000).toLocaleTimeString(),
          temperature: state.getTemperature(),
          humidity: state.getHumidity(),
          brightness: state.getBrightness(),
        });
      });
      setPlotData(newPlotData);
      setModificationsDisabled(false);
    }).catch((err: { message: string; }) => {
      if (err.message === "invalid token") {
          localStorage.removeItem('jwt');
          window.location.href = "/login";
          return;
      }
      console.log(err);
    });
  };

  // setRealtimeData resets the plotData and disables timeseries mode
  const setRealtimeData = () => {
    if (!timeseries) return;
    setPlotData([] as PlotData[]);
    setTimeseries(false);
  };

  const rgbaToHex = (red: number, green: number, blue: number, white: number): string => {
    const hexColor = `#${red.toString(16).padStart(2, '0')}${green.toString(16).padStart(2, '0')}${blue.toString(16).padStart(2, '0')}${white.toString(16).padStart(2, '0')}`;
    return hexColor.toUpperCase();
  }

  const tabletLayout = (
    <Container maxWidth="md">
      <Typography variant="h3" align="center" gutterBottom color="#adbac7">
        {device.getName().split('.')[0]}
      </Typography>
      <Grid container spacing={0} style={{ marginTop: 15 }}>
        <Grid id="stream-container" item xs={9}>
          <img id="stream" style={{ maxWidth: "100%", height: "auto" }} src="https://coopcam1.dinnen.engineering/?stream" alt="stream" />
        </Grid>
        <Grid item xs={3} style={{ overflowY: 'scroll', maxHeight: 430 }}>
          <Grid container spacing={0}>
            <Grid item xs={12} sm={12}>
              <Switch withOverride title="Lights" overridden={state.getLightsoverridden()} onOverride={() => updateCoop({ 'lightsOverridden': !state.getLightsoverridden() })} checked={state.getLights()} disabled={modificationsDisabled} onChange={() => updateCoop({ 'lights': !state.getLights() })} />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Switch title="Recirculation Fan" checked={state.getRecirculationfan()} disabled={modificationsDisabled} onChange={() => updateCoop({ 'recirculationFan': !state.getRecirculationfan() })} />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Switch withOverride overridden={state.getVentoverridden()} onOverride={() => updateCoop({ 'ventOverridden': !state.getVentoverridden() })} title="Vent Fan" checked={state.getVentfan()} disabled={modificationsDisabled} onChange={() => updateCoop({ 'ventFan': !state.getVentfan() })} />
            </Grid>
            <Grid item xs={6} sm={12}>
              <Slider title="Auto Light Ramp Percentage" disabled={modificationsDisabled} value={state.getRamppercentage()} onChange={(e, value) => updateCoop({ 'rampPercentage': value })} />
            </Grid>
            <Grid item xs={6} sm={12}>
              <Slider title="Max Automation Brightness" disabled={modificationsDisabled} value={state.getMaxautomationbrightness()} onChange={(e, value) => updateCoop({ 'maxAutomationBrightness': value })} />
            </Grid>
            <Grid item xs={6} sm={12}>
              <Slider title="Brightness" disabled={modificationsDisabled || !state.getLightsoverridden()} value={!state.getLightsoverridden() ? state.getMaxautomationbrightness() : state.getBrightness()} onChange={(e, value) => updateCoop({ 'brightness': value })} />
            </Grid>
            <Grid item xs={6} sm={12}>
              <ColorPicker
                value={rgbaToHex(state.getRed(), state.getGreen(), state.getBlue(), state.getWhite())}
                onChange={(color) => {
                  updateCoop({ 'color': [...color.rgb, color.alpha] })
                }}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Value title="Temperature" value={state.getTemperature()} unit="°C" />
            </Grid>
            <Grid item xs={12} sm={12}>
              <Guage title="Relative Humidity" value={state.getHumidity() || 0} />
            </Grid>
            {state.hasLightstiming() ? <Grid item xs={12} sm={12}>
              <Timer title="Lights Timing" disabled={modificationsDisabled} value={state.getLightstiming()} onChange={(value: CoopTiming | number) => updateCoop({ 'lightsTiming': value as CoopTiming })} />
            </Grid> : null}
            <Grid item xs={12} sm={12}>
              <StatusLight title="Watered Today" value={state.getWateredtoday()} lastUpdated={state.getWateredlast()} disabled={modificationsDisabled || state.getWateredtoday()} onClick={() => updateCoop({ 'wateredToday': true })} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={0} style={{ marginTop: 40 }}>
        <Grid item xs={12}>
          <LinePlot data={plotData} lines={[{ label: 'temperature', color: '#ff0000' }, { label: 'humidity', color: "#0004ff" }, { label: 'brightness', color: '#e0e014' }]} />
          <FormControl style={{ width: 135, marginLeft: 22, marginRight: 5 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              label="Time Period"
              onChange={(event: SelectChangeEvent<string>) => setTimePeriod(event.target.value)}
            >
              <MenuItem value={15 * 60}>15m</MenuItem>
              <MenuItem value={30 * 60}>30m</MenuItem>
              <MenuItem value={60 * 60}>1h</MenuItem>
              <MenuItem value={120 * 60}>2h</MenuItem>
              <MenuItem value={240 * 60}>4h</MenuItem>
              <MenuItem value={360 * 60}>6h</MenuItem>
              <MenuItem value={720 * 60}>12h</MenuItem>
              <MenuItem value={1440 * 60}>1d</MenuItem>
              <MenuItem value={2880 * 60}>2d</MenuItem>
              <MenuItem value={5760 * 60}>4d</MenuItem>
              <MenuItem value={10080 * 60}>1w</MenuItem>
              <MenuItem value={20160 * 60}>2w</MenuItem>
              <MenuItem value={40320 * 60}>1M</MenuItem>
            </Select>
          </FormControl>
          <Button style={{ marginRight: 5 }} variant="contained" color="primary" disabled={modificationsDisabled} onClick={fetchTimeseries}>Fetch</Button>
          <Button variant="contained" color="primary" disabled={modificationsDisabled} onClick={setRealtimeData}>Realtime</Button>
        </Grid>
      </Grid>
      <Copyright />
    </Container>
  );

  const defaultLayout = (
    <Container maxWidth="md">
      <Typography variant="h3" align="center" gutterBottom color="#adbac7">
        {device.getName().split('.')[0]}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} sm={4}>
          <Switch withOverride title="Lights" overridden={state.getLightsoverridden()} onOverride={() => updateCoop({ 'lightsOverridden': !state.getLightsoverridden() })} checked={state.getLights()} disabled={modificationsDisabled} onChange={() => updateCoop({ 'lights': !state.getLights() })} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Switch title="Recirculation Fan" checked={state.getRecirculationfan()} disabled={modificationsDisabled} onChange={() => updateCoop({ 'recirculationFan': !state.getRecirculationfan() })} />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Switch withOverride overridden={state.getVentoverridden()} onOverride={() => updateCoop({ 'ventOverridden': !state.getVentoverridden() })} title="Vent Fan" checked={state.getVentfan()} disabled={modificationsDisabled} onChange={() => updateCoop({ 'ventFan': !state.getVentfan() })} />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Slider title="Light Ramp Percentage" min={0} disabled={modificationsDisabled} value={state.getRamppercentage()} onChange={(e, value) => updateCoop({ 'rampPercentage': value })} />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Slider title="Max Automation Brightness" min={0} disabled={modificationsDisabled} value={state.getMaxautomationbrightness()} onChange={(e, value) => updateCoop({ 'maxAutomationBrightness': value })} />
        </Grid>
        <Grid item xs={6} sm={4}>
          <Slider title="Brightness" min={0} disabled={modificationsDisabled || !state.getLightsoverridden()} value={!state.getLightsoverridden() ? state.getMaxautomationbrightness() : state.getBrightness()} onChange={(e, value) => updateCoop({ 'brightness': value })} />
        </Grid>
        <Grid item xs={6} sm={4}>
              <ColorPicker
                value={rgbaToHex(state.getRed(), state.getGreen(), state.getBlue(), state.getWhite())}
                onChange={(color) => {
                  updateCoop({ 'color': [...color.rgb, color.alpha] })
                }}
              />
            </Grid>
        <Grid item xs={12} sm={4}>
          <Value title="Temperature" value={state.getTemperature()} unit="°C" />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Guage title="Relative Humidity" value={state.getHumidity() || 0} />
        </Grid>
        {state.hasLightstiming() ? <Grid item xs={12} sm={4}>
          <Timer title="Lights Timing" disabled={modificationsDisabled} value={state.getLightstiming()} onChange={(value: CoopTiming | number) => updateCoop({ 'lightsTiming': value as CoopTiming })} />
        </Grid> : null}
        <Grid item xs={12} sm={4}>
          <StatusLight title="Watered Today" value={state.getWateredtoday()} lastUpdated={state.getWateredlast()} disabled={modificationsDisabled || state.getWateredtoday()} onClick={() => updateCoop({ 'wateredToday': true })} />
        </Grid>
      </Grid>
      <Grid container spacing={0} style={{ marginTop: 40 }}>
        <Grid item xs={12}>
          <FormControl style={{ width: 135, marginLeft: 22, marginRight: 5 }}>
            <InputLabel>Time Period</InputLabel>
            <Select
              value={timePeriod}
              label="Time Period"
              onChange={(event: SelectChangeEvent<string>) => setTimePeriod(event.target.value)}
            >
              <MenuItem value={15 * 60}>15m</MenuItem>
              <MenuItem value={30 * 60}>30m</MenuItem>
              <MenuItem value={60 * 60}>1h</MenuItem>
              <MenuItem value={120 * 60}>2h</MenuItem>
              <MenuItem value={240 * 60}>4h</MenuItem>
              <MenuItem value={360 * 60}>6h</MenuItem>
              <MenuItem value={720 * 60}>12h</MenuItem>
              <MenuItem value={1440 * 60}>1d</MenuItem>
              <MenuItem value={2880 * 60}>2d</MenuItem>
              <MenuItem value={5760 * 60}>4d</MenuItem>
              <MenuItem value={10080 * 60}>1w</MenuItem>
              <MenuItem value={20160 * 60}>2w</MenuItem>
              <MenuItem value={40320 * 60}>1M</MenuItem>
            </Select>
          </FormControl>
          <Button style={{ marginRight: 5 }} variant="contained" color="primary" disabled={modificationsDisabled} onClick={fetchTimeseries}>Fetch</Button>
          <Button variant="contained" color="primary" disabled={modificationsDisabled} onClick={setRealtimeData}>Realtime</Button>
          <LinePlot data={plotData} lines={[{ label: 'temperature', color: '#ff0000' }, { label: 'humidity', color: "#0004ff" }, { label: 'brightness', color: '#e0e014' }]} />
        </Grid>
      </Grid>
      <Grid container spacing={0} style={{ marginTop: 40 }}>
        <Grid id="stream-container" item xs={12}>
          <img id="stream" style={{ maxWidth: "100%", height: "auto" }} src="https://coopcam1.dinnen.engineering/?stream" alt="stream" />
        </Grid>
      </Grid>
      <Copyright />
    </Container>
  );

  // Check if the current display width is 7" display-like (for Raspberry Pi 7" display)
  const displayWidth800 = window.innerWidth <= 800 && window.innerWidth >= 600;

  const layoutToDisplay = displayWidth800 ? tabletLayout : defaultLayout;

  return layoutToDisplay;
}