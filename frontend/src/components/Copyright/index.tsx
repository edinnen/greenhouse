import { Typography, Link } from '@mui/material'; 

export default function Copyright() {
    return (
      <Typography variant="body2" color="#adbac7" align="center" sx={{ my: 5 }}>
        {'Copyright © '}
        <Link color="inherit" href="https://www.youtube.com/watch?v=dQw4w9WgXcQ">
          Doncaster Dudes
        </Link>{' '}
        {new Date().getFullYear()}
      </Typography>
    );
  }