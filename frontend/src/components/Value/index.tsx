import { Container, Paper, Box, Typography } from '@mui/material';

interface ValueProps {
    title: string;
    value: number | string;
    unit?: string;
}

export default function Value({ title, value, unit }: ValueProps) {

    const roundTwoDecimals = (value: number) => {
        return Math.round(value * 100) / 100;
    }

    return (
        <Container style={{ padding: 5, paddingLeft: 20 }}>
            <Paper elevation={3} sx={{ backgroundColor: "rgb(34, 39, 46)", color: '#adbac7' }}>
                <Box sx={{ px: 2, paddingTop:  1}}>
                    <Typography variant="overline" component="div" align='left'>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ px: 2 }}>
                    <Typography variant="caption" component="div" align='left' sx={{ py: 1, fontSize: "1.2rem", fontWeight: 400 }}>
                        {typeof value === 'number' ? roundTwoDecimals(value) : value}{unit ? <sup>{unit}</sup> : null}
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}