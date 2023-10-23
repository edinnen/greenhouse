import { useState, useEffect } from 'react';
import { CommandControlClient } from 'proto/CommandControlServiceClientPb';
import { Container, TextField, Button } from '@mui/material';
import { login } from '../../utils';

type LoginProps = {
    commandControlClient: CommandControlClient;
}

export default function Login({ commandControlClient }: LoginProps) {
    const [enteredPassword, setEnteredPassword] = useState("");

    // handleLogin fetches a JWT from the server and stores it in localStorage before fetching the state
    const handleLogin = async () => {
        try {
            const response = await login(commandControlClient, enteredPassword);
            localStorage.setItem("jwt", response.getJwt());
            document.cookie = `jwt=${response.getJwt()}`;
            window.location.href = "/";
        } catch (err) {
            console.log("Login failed", err);
        }
    };

    // Handle Enter key press for login text input
    const catchReturn = (ev: any) => {
        if (!ev) return;
        if (ev.key === 'Enter') {
            ev.preventDefault();
            handleLogin();
        }
    }

    return (
        <Container>
            <TextField id="standard-basic" label="Password" type="password" variant="outlined" onKeyDown={catchReturn} onChange={(data) => setEnteredPassword(data.target.value)} />
            <br />
            <Button variant="contained" onKeyDown={handleLogin} onClick={handleLogin}>Login</Button>
        </Container>
    );
}