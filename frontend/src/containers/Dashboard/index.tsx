import AddBoxIcon from '@mui/icons-material/AddBox';
import { Box, Button, Container, IconButton, Paper, TextField, Typography } from '@mui/material';
import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { Devices, Zone, Zones } from 'proto/commandControl_pb';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CreateZoneModal } from "../../components";
import { createZone, getDevices, getZones } from '../../utils';

type DashboardProps = {
    commandControlClient: CommandControlClient;
}

export default function Dashboard({ commandControlClient }: DashboardProps) {
    const [zones, setZones] = useState<Zones>();
    const [devices, setDevices] = useState<Devices>();
    const [createZoneOpen, setCreateZoneOpen] = useState(false);

    useEffect(() => {
        const currentJwt = localStorage.getItem('jwt') || "";
        if (!currentJwt) {
            window.location.href = "/login";
            return;
        };
        // Set jwt cookie
        document.cookie = `jwt=${currentJwt}`;
        async function fetchZones() {
            const zones = await getZones(commandControlClient);
            setZones(zones);
        }
        async function fetchDevices() {
            const devices = await getDevices(commandControlClient);
            setDevices(devices);
        }
        try {
            fetchZones();
            fetchDevices();
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

    const handleCreateZone = async (zone: Zone) => {
        const newZones = await createZone(commandControlClient, zone);
        setZones(newZones);
        setCreateZoneOpen(false);
    };

    return (
        <Container maxWidth={false} style={{ display: "flex", flexWrap: "wrap" }}>
            {zones && zones.getZonesList().map((zone) => (
                <Box style={{ display: "inline-flex", padding: 8 }}>
                    <Link to={`/zone/${zone.getId()}`} style={{ textDecoration: "none" }}>
                        <Paper elevation={3} key={zone.getId()} style={{ minHeight: "100%", display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "rgb(34, 39, 46)", border: "1px solid rgb(55, 62, 71)" }}>
                            <Box sx={{ px: 2, paddingTop: 1 }}>
                                <Typography variant="h2" align="left" color="#adbac7">
                                    {zone.getName()}
                                </Typography>
                            </Box>
                            <Box sx={{ px: 2 }}>
                                <Typography variant="caption" component="div" align="left" color="#adbac7" sx={{ py: 1, fontSize: "1.2rem", fontWeight: 400 }}>
                                    {zone.getDevicesList().length} devices connected
                                </Typography>
                            </Box>
                        </Paper>
                    </Link>
                </Box>
            ))}
            <IconButton onClick={() => setCreateZoneOpen(true)}>
                <Paper elevation={3} style={{ backgroundColor: "rgb(34, 39, 46)", border: "1px solid rgb(55, 62, 71)" }}>
                    <Box sx={{ px: 8, py: 8 }}>
                        <Typography variant="h4" align="center" color="#adbac7">
                            Create<br/> New Zone
                        </Typography>
                    </Box>
                    <Box sx={{ px: 8, py: 8 }}>
                        <AddBoxIcon style={{ fontSize: "3rem", color: "#adbac7" }} />
                    </Box>
                </Paper>
            </IconButton>
            <CreateZoneModal open={createZoneOpen} onClose={() => setCreateZoneOpen(false)} handleCreate={handleCreateZone} />
        </Container>
    );
}