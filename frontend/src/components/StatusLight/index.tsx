import { Container, Paper, Box, Typography } from '@mui/material';

interface StatusLightProps {
    title: string;
    value: boolean;
    lastUpdated?: number;
    disabled: boolean;
    onClick?: () => void;
}

export default function StatusLight({ title, value, lastUpdated, disabled, onClick }: StatusLightProps) {
    const defaultStyle = { borderRadius: '50%', height: '6rem', width: '6rem', marginTop: 15, marginBottom: 15 };
    return (
        <Container style={{ padding: 5, paddingLeft: 20 }}>
            <Paper elevation={3} style={{ position: 'relative', minHeight: 180, backgroundColor: "rgb(34, 39, 46)", color: "#adbac7" }}>
                <Box sx={{ px: 2, paddingTop:  1}}>
                    <Typography variant="overline" component="div" align='left'>
                        {title}
                    </Typography>
                </Box>
                <Box sx={{ px: 2 }} style={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center' }}>
                    <div style={value ? { ...defaultStyle, backgroundColor: 'green' } : { ...defaultStyle, backgroundColor: 'red' }} onClick={!disabled ? onClick : () => {}} />
                    {lastUpdated ? (
                        <Typography variant="caption" component="div" align='left' style={{ marginBottom: 10 }}>
                            Last: {new Date(lastUpdated * 1000).toLocaleString()}
                        </Typography>
                    ) : null}
                </Box>
            </Paper>
        </Container>
    );
}