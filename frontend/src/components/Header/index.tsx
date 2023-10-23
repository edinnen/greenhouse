import { Container, Box, Typography } from "@mui/material";

export default function Header() {
    return (
      <Container maxWidth="sm">
        <Box sx={{ my: 2 }}>
          <Typography align="center" variant="h4" component="h1">
             Doncaster Greenhouse Control
          </Typography>
        </Box>
      </Container>
    );
  }