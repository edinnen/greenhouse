import { useState } from 'react';
import { Dialog, DialogTitle, Button, TextField } from "@mui/material";
import { Zone } from 'proto/commandControl_pb';

export interface CreateZoneModalProps {
    open: boolean;
    onClose: () => void;
    handleCreate: (zone: Zone) => void;
}

export default function CreateZoneModal({ onClose, open, handleCreate }: CreateZoneModalProps) {
    const [name, setName] = useState("");
    const [disabled, setDisabled] = useState(false);
    const handleClose = () => {
        onClose();
    };
    const handleCreateZone = () => {
        setDisabled(true);
        const zone = new Zone();
        zone.setName(name);
        handleCreate(zone);
        setDisabled(false);
    }
  
    return (
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Create New Zone</DialogTitle>
        <TextField id="outlined-basic" label="Zone Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} type="string" />
        <Button onClick={handleCreateZone} disabled={disabled}>Create</Button>
        <Button onClick={handleClose} disabled={disabled}>Cancel</Button>
      </Dialog>
    );
}