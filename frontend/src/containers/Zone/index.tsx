import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Devices, Zone } from 'proto/commandControl_pb';
import { Container, Typography, Paper, Box, IconButton } from '@mui/material';
import { getZone, getDevices, updateDevice, getComponentForDevice } from '../../utils';
import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { AdoptDevice } from '../../components';
import { GreenhouseClient } from 'proto/GreenhouseServiceClientPb';
import { IrrigationClient } from 'proto/IrrigationServiceClientPb';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReplayIcon from '@mui/icons-material/Replay';

export interface ZoneProps {
    commandControlClient: CommandControlClient;
    greenhouseClient: GreenhouseClient;
    irrigationClient: IrrigationClient;
}

export default function ZoneContainer({ commandControlClient, greenhouseClient, irrigationClient }: ZoneProps) {
    const { id } = useParams();
    const [zone, setZone] = useState<Zone>();
    const [devices, setDevices] = useState<Devices>();
    const [adopting, setAdopting] = useState(false);

    useEffect(() => {
        const currentJwt = localStorage.getItem('jwt') || "";
        if (!currentJwt) return;

        async function fetchZones() {
            const zone = await getZone(commandControlClient, parseInt(id || "0"));
            setZone(zone);
        }
        async function fetchDevices() {
            const devices = await getDevices(commandControlClient);
            setDevices(devices);
        }
        fetchZones();
        fetchDevices();
        return () => {}
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdoption = async (deviceName: string) => {
        if (!deviceName || !zone) {
            setAdopting(false);
            return;
        };

        const device = devices?.getOrphanedList().find(d => d.getName() === deviceName);
        if (!device) {
            setAdopting(false);
            return;
        }

        device.setAdopted(true);
        device.setZone(zone.getId());
        await updateDevice(commandControlClient, device);
        const newDevices = await getDevices(commandControlClient);
        setDevices(newDevices);
        setAdopting(false);
    }

    return (
        <Container maxWidth={false} style={{ display: "flex", flexDirection: "column", flexWrap: "wrap", justifyContent: "center" }}>
            <Box style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box style={{ paddingTop: 25 }}>
                    <ArrowBackIcon onClick={() => window.history.back()} style={{ cursor: 'pointer' }} htmlColor="white" sx={{ height: "3em", width: "3em" }} />
                </Box>
                <Box>
                    <Typography variant="h1" align="center" color="#adbac7" style={{ marginBottom: 10 }}>{zone?.getName()}</Typography>
                </Box>
                <Box style={{ paddingTop: 25 }}>
                    <ReplayIcon onClick={() => window.location.reload()} style={{ cursor: 'pointer' }} htmlColor="white" sx={{ height: "3em", width: "3em" }} />
                </Box>
            </Box>

            {zone && devices?.getAdoptedList().map((device, index) => {
                if (device.getZone() !== zone.getId()) return null;
                return (
                    <Paper elevation={1} style={{ backgroundColor: "rgb(34, 39, 46)", border: "1px solid rgb(55, 62, 71)", margin: 10, paddingTop: 20 }} key={index}>
                        {getComponentForDevice(device, commandControlClient, greenhouseClient, irrigationClient)}
                    </Paper>
                );
            })}

            {zone && devices && devices?.getOrphanedList().length > 0 && (
            <>
                <IconButton onClick={() => setAdopting(true)}>
                    <Paper elevation={3} style={{ backgroundColor: "rgb(34, 39, 46)", border: "1px solid rgb(55, 62, 71)" }}>
                        <Box sx={{ px: 8, py: 8 }}>
                            <Typography variant="h4" align="center" color="#adbac7">
                                Adopt a new device
                            </Typography>
                        </Box>
                    </Paper>
                </IconButton>
                <AdoptDevice open={adopting} onClose={handleAdoption} devices={devices} />
            </>
            )}
        </Container>
    );
}