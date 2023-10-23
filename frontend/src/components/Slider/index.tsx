import { useState, useEffect } from 'react';
import { Container, Paper, Box, Slider as MuiSlider, Typography } from '@mui/material';

interface ValueProps {
    title: string;
    value: number;
    onChange: (event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => void;
    disabled?: boolean;
    min?: number;
    max?: number;
    defaultVal?: number;
}

export default function Slider({ title, value, onChange, disabled, min, max, defaultVal }: ValueProps) {
    const [valueState, setValueState] = useState(value);

    const handleChange = (event: Event | React.SyntheticEvent<Element, Event>, value: number | number[]) => {
        setValueState(value as number);
    };

    useEffect(() => {
        setValueState(value);
    }, [value])

    return (
        <Container style={{ padding: 5, paddingLeft: 20 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(34, 39, 46)", color: '#adbac7' }}>
                <Box sx={{ px: 2, paddingTop:  1}}>
                    <Typography variant="overline" component="div" align='left'>
                        {title}
                    </Typography>
                </Box>
                <Box style={{ paddingLeft: 20, paddingRight: 20 }}>
                    <MuiSlider min={min || 10} max={max || 100} defaultValue={defaultVal || 10} value={valueState} aria-label={title} valueLabelDisplay="auto" onChange={handleChange} onChangeCommitted={onChange} disabled={disabled} />
                </Box>
            </Paper>
        </Container>
    );
}