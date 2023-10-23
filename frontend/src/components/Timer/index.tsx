import { useState } from 'react';
import { Container, Paper, Box, Typography, TextField } from '@mui/material';
import { TimePicker, LocalizationProvider } from '@mui/lab';
import DateAdapter from '@mui/lab/AdapterMoment';
import { Timing, Timestamp } from '../../proto/greenhouse_pb';
import moment from 'moment';

interface TimerProps {
    title: string;
    value: Timing | number | undefined;
    disabled?: boolean;
    onChange: (value: Timing | number) => void;
    noEnd?: boolean;
}

function usableDate(seconds: number | undefined): moment.Moment {
    if (!seconds) return moment();
    // Calculate current time from seconds since midnight
    const now = moment();
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds - (hours * 3600)) / 60);
    const seconds_ = 0;
    return now.hour(hours).minute(minutes).second(seconds_);
}

export default function Timer({ title, value, onChange, disabled, noEnd }: TimerProps) {
    const [timing, setTiming] = useState(value);

    const handleChange = (date: moment.Moment | null, isStart: boolean = true) => {
        if (!date || !timing) return;
        const newTiming: Timing = timing as Timing;
        const newTimestamp = new Timestamp();
        const newSeconds = date?.unix() - date?.startOf('day').unix();
        if (newSeconds === 0) return;
        newTimestamp.setSeconds(newSeconds);
        if (isStart) {
            newTiming.setStart(newTimestamp);
        } else {
            newTiming.setEnd(newTimestamp);
        }

        setTiming(newTiming);
        onChange(newTiming);
    }

    const handleNumberChange = (date: moment.Moment | null) => {
        if (!date) return;
        const newSeconds = date?.unix() - date?.startOf('day').unix();
        if (newSeconds === 0) return;
        setTiming(newSeconds);
        onChange(newSeconds);
    };

    let picker;
    if (typeof value === 'number') {
        picker = (
            <TimePicker label={`${title} Start`} disabled={disabled} value={usableDate(timing as number)} onChange={(date: moment.Moment | null) => handleNumberChange(date)} renderInput={(params) => <TextField color="primary" {...params} />} />
        ); 
    } else {
        picker = (
            <>
                <TimePicker label={`${title} Start`} disabled={disabled} value={usableDate((timing as Timing)?.getStart()?.getSeconds())} onChange={(date: moment.Moment | null) => handleChange(date)} renderInput={(params) => <TextField color="primary" {...params} />} />
                    <br /><br />
                {noEnd ? null : <TimePicker label={`${title} End`} disabled={disabled} value={usableDate((timing as Timing)?.getEnd()?.getSeconds())} onChange={(date: moment.Moment | null) => handleChange(date, false)} renderInput={(params) => <TextField color="primary" {...params} />} />}
            </>
        );
    }

    return (
        <Container style={{ padding: 5, paddingLeft: 20 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(34, 39, 46)", color: '#adbac7' }}>
                <Box sx={{ px: 2, paddingTop: 1 }}>
                    <Typography variant="overline" component="div" align='left'>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ px: 2, py: 2 }}>
                    <LocalizationProvider dateAdapter={DateAdapter}>
                        {picker}
                    </LocalizationProvider>
                </Box>
            </Paper>
        </Container>
    );
}