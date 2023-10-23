import { Container, Typography, Box, CircularProgress, Paper } from '@mui/material';

interface GuageProps {
    title: string;
    value: number;
}

export default function Guage({ title, value }: GuageProps) {
    return (
        <Container style={{ padding: 5, paddingLeft: 20 }}>
            <Paper elevation={3} style={{ backgroundColor: "rgb(34, 39, 46)", color: "#adbac7" }}>
                <Typography variant="overline" component="div" align='center' sx={{ paddingTop: 1 }}>
                    {title}
                </Typography>
                <Box
                    sx={{
                        width: '100%',
                        padding: 2,
                        display:
                        'inline-flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        position: 'relative'
                    }}
                >
                    <CircularProgress thickness={5} size={100} variant='determinate' value={value} />
                    <Box
                        sx={{
                            top: 0,
                            left: 0,
                            bottom: 0,
                            right: 0,
                            position: 'absolute',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="caption" component="div" color="#adbac7">
                            {`${Math.round(value)}%`}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
      </Container>
    );
  }