import { useState, useEffect } from "react";
import * as grpcWeb from 'grpc-web'
import { Device } from "proto/commandControl_pb";
import { IrrigationClient } from "proto/IrrigationServiceClientPb";
import { Irrigator, Solenoid } from "proto/irrigation_pb";
import { Switch, Timer, Value } from "components";
import { Box, Button, Container, Dialog, DialogTitle, Grid, IconButton, Paper, TextField, Typography } from "@mui/material";
import AddBoxIcon from '@mui/icons-material/AddBox';
import SolenoidControl from "components/Solenoid";
import { Timing } from "proto/greenhouse_pb";

type IrrigationProps = {
    irrigationClient: IrrigationClient;
    device: Device;
}

async function getState(irrigationClient: IrrigationClient, id: number): Promise<Irrigator> {
    return new Promise((res, rej) => {
        const request = new Irrigator();
        request.setId(id);
        irrigationClient.getState(request, { "authorization": localStorage.getItem('jwt') || ""}, (err: grpcWeb.RpcError, response: Irrigator) => {
            if (err) {
                return rej(err);
            }
            return res(response)
        });
    });
}

async function setState(irrigationClient: IrrigationClient, irrigator: Irrigator): Promise<Irrigator> {
    return new Promise((res, rej) => {
        irrigationClient.setState(irrigator, { "authorization": localStorage.getItem('jwt') || ""}, (err: grpcWeb.RpcError, response: Irrigator) => {
            if (err) {
                return rej(err);
            }
            return res(response)
        });
    });
}

export default function Irrigation({ irrigationClient, device }: IrrigationProps) {
    const [id] = useState(device.getId());
    const [irrigator, setIrrigator] = useState<Irrigator>();
    const [disabled, setDisabled] = useState(false);
    const [openCreateSolenoid, setOpenCreateSolenoid] = useState(false);
    const [pinNumber, setPinNumber] = useState("");

    useEffect(() => {
        const jwt = localStorage.getItem('jwt') || "";
        if (!jwt) {
            window.location.href = "/login";
            return;
        }

        if (!device) return;
        const getIrrigator = async () => {
            const ir = await getState(irrigationClient, device.getId());
            setIrrigator(ir);
        };
        try {
            getIrrigator();
        } catch (err: any) {
            if (err.message === "invalid token") {
                localStorage.removeItem('jwt');
                window.location.href = "/login";
                return;
            }
            console.log(err);
        }
        return () => {};
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const timeoutID = setTimeout(async () => {
            try {
                const ir = await getState(irrigationClient, device.getId());
                setIrrigator(ir);
            } catch (err: any) {
                if (err.message === "invalid token") {
                    localStorage.setItem('jwt', "");
                }
            }
        }, 5 * 1000);

        return () => {
            clearTimeout(timeoutID);
        };
    }, [irrigator, device, irrigationClient]);

    const handleCreateSolenoid = async () => {
        if (!pinNumber || !irrigator) return;
        setDisabled(true);
        const newSolenoid = new Solenoid();
        newSolenoid.setPin(parseInt(pinNumber));
        newSolenoid.setState(0);

        if (irrigator.getSolenoidsList().length === 5) {
            alert("You can only have 5 solenoids");
            setDisabled(false);
            return;
        }

        if (irrigator.getId() === 0) {
            irrigator.setId(id);
        }

        irrigator.addSolenoids(newSolenoid);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
        setOpenCreateSolenoid(false);
        setDisabled(false);
    };

    const handleDeleteSolenoid = async (solenoid: Solenoid) => {
        if (!irrigator) return;
        setDisabled(true);
        const list: Solenoid[] = irrigator.getSolenoidsList()
        const newList: Solenoid[] = [];
        for (const sol of list) {
            if (sol.getPin() !== solenoid.getPin()) {
                newList.push(sol);
            }
        }
        irrigator.setSolenoidsList(newList);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
        setDisabled(false);
    };

    const handleChangeSolenoidState = async (solenoid: Solenoid) => {
        if (!irrigator) return;
        setDisabled(true);
        const list: Solenoid[] = irrigator.getSolenoidsList()
        const newList: Solenoid[] = [];
        for (const sol of list) {
            if (sol.getPin() !== solenoid.getPin()) {
                newList.push(sol);
            } else {
                sol.setState(solenoid.getState() === Solenoid.State.OFF ? Solenoid.State.ON : Solenoid.State.OFF);
                newList.push(sol);
            }
        }
        irrigator.setSolenoidsList(newList);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
        setDisabled(false);
    };

    const handleOverrideSolenoid = async (solenoid: Solenoid) => {
        if (!irrigator) return;
        setDisabled(true);
        const list: Solenoid[] = irrigator.getSolenoidsList()
        const newList: Solenoid[] = [];
        for (const sol of list) {
            if (sol.getPin() !== solenoid.getPin()) {
                newList.push(sol);
            } else {
                sol.setOverride(!solenoid.getOverride());
                newList.push(sol);
            }
        }
        irrigator.setSolenoidsList(newList);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
        setDisabled(false);
    };

    const handleSetHoseLength = async (length: number, solenoidIndex: number) => {
        if (!irrigator) return;
        const list: Solenoid[] = irrigator.getSolenoidsList()
        const newList: Solenoid[] = [];
        for (const sol of list) {
            if (sol.getPin() !== list[solenoidIndex].getPin()) {
                newList.push(sol);
            } else {
                sol.setLengthofsoakerhose(length);
                newList.push(sol);
            }
        }
        irrigator.setSolenoidsList(newList);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
    };

    const handleSetDispenseAmount = async (amount: number, solenoidIndex: number) => {
        if (!irrigator) return;
        const list: Solenoid[] = irrigator.getSolenoidsList()
        const newList: Solenoid[] = [];
        for (const sol of list) {
            if (sol.getPin() !== list[solenoidIndex].getPin()) {
                newList.push(sol);
            } else {
                sol.setLitrestodispense(amount);
                newList.push(sol);
            }
        }
        irrigator.setSolenoidsList(newList);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
    };

    const handleSetTiming = async (timing: Timing | number) => {
        if (!irrigator) return;
        setDisabled(true);
        irrigator.setTiming(timing as number);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
        setDisabled(false);
    };

    const resetLastWatered = async () => {
        if (!irrigator) return;
        setDisabled(true);
        // Calculate unix time from now - 24 hours
        irrigator.setLastwatered(1651397516);
        irrigator.setIrrigating(false);
        // Set all solenoid litresDispensed to 0
        const list: Solenoid[] = irrigator.getSolenoidsList()
        const newList: Solenoid[] = [];
        for (const sol of list) {
            sol.setState(Solenoid.State.OFF);
            sol.setLitresdispensed(0);
            newList.push(sol);
        }
        irrigator.setSolenoidsList(newList);
        const newIrrigator = await setState(irrigationClient, irrigator);
        setIrrigator(newIrrigator);
        setDisabled(false);
    };

    return (
        <Container maxWidth="md">
            <Typography variant="h3" align="center" gutterBottom color="#adbac7">
                {device.getName().split('.')[0]}
            </Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                    <Value title="Rain Lockout" value={irrigator?.getRainlockout() ? 'True' : 'False'} unit="" />
                </Grid>
                {irrigator?.getRainlockout() ? (
                    <Grid item xs={12} sm={6} md={4}>
                        <Value title="Lockout Until" value={irrigator ? new Date(irrigator.getLastlockout() * 1000 + 86400000).toString() : ""} unit="" /> {/* Add 1 day in milliseconds to lockout time to get unlock time */}
                    </Grid>
                ) : null}
                {irrigator && (<Grid item xs={12} sm={6} md={4}>
                    <Timer noEnd title="Start Time" disabled={disabled} value={irrigator.getTiming()} onChange={handleSetTiming} />
                </Grid>)}
                <Grid item xs={12} sm={6} md={4}>
                    <Value title="Last finished" value={irrigator ? new Date(irrigator.getLastwatered() * 1000).toString() : ""} unit="" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Value title="Temperature" value={irrigator?.getTemperature() || 0} unit="°C" />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                    <Button variant="contained" color="primary" onClick={resetLastWatered} disabled={disabled}>Reset last watered</Button>
                </Grid>
                {irrigator && irrigator.getSolenoidsList().map((solenoid, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                        <SolenoidControl
                            withOverride
                            title={`Solenoid #${i+1}`}
                            solenoidIndex={i}
                            hoseLength={solenoid.getLengthofsoakerhose()}
                            dispenseAmount={solenoid.getLitrestodispense()}
                            setHoseLength={handleSetHoseLength}
                            setDispenseAmount={handleSetDispenseAmount}
                            litresDispensed={solenoid.getLitresdispensed()}
                            overridden={solenoid.getOverride()}
                            onOverride={() => handleOverrideSolenoid(solenoid)}
                            checked={!!solenoid.getState().valueOf()}
                            disabled={disabled}
                            onChange={() => handleChangeSolenoidState(solenoid)}
                            onDelete={() => handleDeleteSolenoid(solenoid)}
                        />
                    </Grid>
                ))}
                <Grid item xs={12} sm={6} md={4}>
                    <IconButton onClick={() => setOpenCreateSolenoid(true)}>
                        <Paper elevation={3} style={{ backgroundColor: "rgb(34, 39, 46)", border: "1px solid rgb(55, 62, 71)" }}>
                            <Box sx={{ px: 8, py: 8 }}>
                                <Typography variant="h4" align="center" color="#adbac7">
                                    <AddBoxIcon style={{ fontSize: "3rem", color: "#adbac7" }} />
                                </Typography>
                            </Box>
                        </Paper>
                    </IconButton>
                </Grid>
            </Grid>
            <Dialog onClose={handleCreateSolenoid} open={openCreateSolenoid}>
                <DialogTitle>Configure a new solenoid</DialogTitle>
                <TextField id="outlined-basic" label="Pin number" variant="outlined" onChange={(e) => setPinNumber(e.target.value)} />
                <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                    <Button onClick={handleCreateSolenoid}>Okay</Button>
                    <Button onClick={() => setOpenCreateSolenoid(false)}>Cancel</Button>
                </Box>
            </Dialog>
        </Container>
    )
}