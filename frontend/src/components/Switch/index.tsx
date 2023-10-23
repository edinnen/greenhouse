import { ChangeEvent } from 'react';
import { Container, Paper, Box, Typography, FormGroup, FormControlLabel, Switch as MuiSwitch, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface ValueProps {
    withOverride?: boolean;
    overridden?: boolean;
    title: string;
    checked: boolean;
    onChange: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    onOverride?: (event: ChangeEvent<HTMLInputElement>, checked: boolean) => void;
    onDelete?: () => void;
    disabled?: boolean;
}

export default function Switch({ withOverride, overridden, title, checked, onChange, onOverride, disabled, onDelete }: ValueProps) {
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
                {onDelete ? (
                    <IconButton onClick={onDelete} disabled={disabled}>
                        <DeleteIcon />
                    </IconButton>
                ) : null}
            </Paper>
        </Container>
    );
}