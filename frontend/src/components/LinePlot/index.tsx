import { LineChart, XAxis, Tooltip, Line, CartesianGrid, Legend, ResponsiveContainer } from 'recharts';
import { Container, Paper } from '@mui/material';
import React from 'react';

interface LineProps {
    label: string;
    color: string;
}

interface LinePlotProps {
    data: any;
    lines: LineProps[];
}

export default function LinePlot({ data, lines }: LinePlotProps) {

    const linesToDraw = lines.map(({ label, color }: LineProps, i) => {
        return <Line type="monotone" dataKey={label} key={label} stroke={color} yAxisId={i} />;
    });

    return (
        <Container maxWidth="lg" sx={{ padding: 1 }} style={{ padding: 0, paddingBottom: 10 }}>
            <Paper elevation={3} sx={{ display: "flex", justifyContent: "center", height: 350, backgroundColor: "rgb(34, 39, 46)" }}>
                <ResponsiveContainer width="100%" height={340}>
                    <LineChart
                        width={550}
                        height={400}
                        data={data}
                        margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                    >
                        <XAxis dataKey="time" />
                        <Tooltip />
                        <CartesianGrid stroke="#f5f5f5" />
                        { linesToDraw }
                        <Legend wrapperStyle={{ position: 'relative', bottom: 22, paddingBottom: 0 }} />
                    </LineChart>
                </ResponsiveContainer>
            </Paper>
        </Container>
    );
}