import { useState } from 'react';
import { Dialog, DialogTitle, Button, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent, Box } from "@mui/material";
import { Devices } from "proto/commandControl_pb";

export interface AdoptDeviceProps {
    open: boolean;
    onClose: (selectedDevice: string) => void;
    devices?: Devices;
}

export default function AdoptDevice({ onClose, open, devices }: AdoptDeviceProps) {
    const [selectedDevice, setSelectedDevice] = useState<string>("");

    const handleClose = () => {
      onClose(selectedDevice);
    };

    const noDevices = (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>No new devices are available</DialogTitle>
        <Button onClick={handleClose}>Close</Button>
      </Dialog>
    )

    if (!devices?.getOrphanedList().length) return noDevices;
  
    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Adopt a new device</DialogTitle>
        <FormControl style={{ width: 135, margin: "0 auto" }}>
          <InputLabel>Devices</InputLabel>
          <Select
            value={selectedDevice}
            label="Device"
            onChange={(event: SelectChangeEvent<string>) => setSelectedDevice(event.target.value)}
          >
            {devices.getOrphanedList().map((device, index) => (
              <MenuItem color="#adbac7" key={index} value={device.getName()}>{device.getName().split('.')[0]}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <Box sx={{ display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
          <Button onClick={handleClose}>Okay</Button>
          <Button onClick={() => onClose("")}>Cancel</Button>
        </Box>
      </Dialog>
    );
}