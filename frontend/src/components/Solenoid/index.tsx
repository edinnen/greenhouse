import { ChangeEvent } from 'react';
import { Container, Paper, Box, Typography, FormGroup, FormControlLabel, Switch as MuiSwitch, IconButton, TextField } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface SolenoidProps {
    withOverride?: boolean;
    overridden?: boolean;
    title: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    onOverride?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    onDelete?: () => void;
    disabled?: boolean;
    setHoseLength: (length: number, index: number) => void;
    setDispenseAmount: (amount: number, index: number) => void;
    hoseLength: number;
    dispenseAmount: number;
    solenoidIndex: number;
    litresDispensed: number;
}

// limitToTwoDecimals
const limitToTwoDecimals = (value: number) => {
    return Math.round(value * 100) / 100;
}

export default function SolenoidControl({ withOverride, overridden, title, checked, onChange, onOverride, disabled, onDelete, setHoseLength, setDispenseAmount, hoseLength, dispenseAmount, solenoidIndex, litresDispensed }: SolenoidProps) {
    return (
        <Container style={{ padding: 5, paddingLeft: 20 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(34, 39, 46)", color: '#adbac7' }}>
                <Box sx={{ px: 2, paddingTop:  1}}>
                    <Typography variant="overline" component="div" align='left'>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                    <FormGroup>
                        <FormControlLabel control={<MuiSwitch checked={checked} disabled={disabled || (withOverride && !overridden)} onChange={onChange} />} label={checked ? "On" : "Off"} />
                        {withOverride ? <FormControlLabel control={<MuiSwitch checked={overridden} disabled={disabled} onChange={onOverride} />} label={overridden ? "Override on" : "Override off"} /> : null}
                    </FormGroup>
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                    <TextField id="outlined-basic" label="Total length of hose (meters)" variant="outlined" value={hoseLength} onChange={(e) => setHoseLength(parseFloat(e.target.value), solenoidIndex)} type="number" />
                    <TextField id="outlined-basic" label="Litres to dispense" variant="outlined" value={dispenseAmount} onChange={(e) => setDispenseAmount(parseFloat(e.target.value), solenoidIndex)} type="number" />
                </Box>
                <Box sx={{ px: 2, py: 1 }}>
                    Amount dispensed: {limitToTwoDecimals(litresDispensed)}L
                </Box>
                {onDelete ? (
                    <IconButton onClick={onDelete} disabled={disabled}>
                        <DeleteIcon />
                    </IconButton>
                ) : null}
            </Paper>
        </Container>
    );
}