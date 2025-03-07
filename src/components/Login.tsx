import { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  FormControlLabel,
  Switch,
  Link,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Person as PersonIcon, Lock as LockIcon } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { 
  getAuth, 
  sendPasswordResetEmail, 
  setPersistence, 
  browserSessionPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword 
} from 'firebase/auth';

// Meteor shower background animation
const MeteorShower = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        zIndex: 0,
        '&::before, &::after': {
          content: '""',
          position: 'absolute',
          width: '2px',
          height: '2px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.5)',
          boxShadow: `
            0 0 60px 30px rgba(255, 255, 255, 0.05),
            0 0 100px 60px rgba(255, 255, 255, 0.05),
            0 0 140px 90px rgba(255, 255, 255, 0.05)
          `,
          animation: 'meteor 5s linear infinite',
        },
        '&::before': {
          top: '50%',
          left: '50%',
          animationDelay: '0.6s',
        },
        '&::after': {
          top: '30%',
          left: '40%',
          animationDelay: '0.2s',
        },
        '@keyframes meteor': {
          '0%': { transform: 'rotate(215deg) translateX(0)', opacity: 1 },
          '70%': { opacity: 1 },
          '100%': {
            transform: 'rotate(215deg) translateX(-500px)',
            opacity: 0,
          },
        },
      }}
    />
  );
};

export default function Login() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    // Initialize from localStorage if available
    const remembered = localStorage.getItem('rememberMe');
    return remembered === 'true';
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError('');
      setLoading(true);
      
      const auth = getAuth();
      // Set the persistence based on rememberMe value
      const persistenceType = rememberMe ? browserLocalPersistence : browserSessionPersistence;
      
      await setPersistence(auth, persistenceType);
      // Use the login function from AuthContext instead of direct Firebase auth
      await login(email, password);
      
      // Save rememberMe preference
      localStorage.setItem('rememberMe', rememberMe.toString());
      
      // Clear form fields after successful login
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked;
    setRememberMe(newValue);
    localStorage.setItem('rememberMe', newValue.toString());
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) {
      setResetError('Please enter your email address');
      return;
    }

    try {
      setResetError('');
      setLoading(true);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
      // Clear the reset email field
      setResetEmail('');
    } catch (error: any) {
      setResetSuccess(false);
      switch (error.code) {
        case 'auth/user-not-found':
          setResetError('No user found with this email address');
          break;
        case 'auth/invalid-email':
          setResetError('Invalid email address');
          break;
        default:
          setResetError('Failed to send password reset email');
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetDialogClose = () => {
    setResetDialogOpen(false);
    setResetEmail('');
    setResetError('');
    setResetSuccess(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <MeteorShower />
      
      <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1 }}>
        <Paper
          elevation={24}
          sx={{
            p: isMobile ? 3 : 4,
            borderRadius: 4,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
            }}
          >
            <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              color="primary"
              sx={{
                mb: 3,
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Login
            </Typography>

            <TextField
              required
              fullWidth
              label="Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                startAdornment: (
                  <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />

            <TextField
              required
              fullWidth
              type="password"
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <LockIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            />

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 1,
              }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    color="primary"
                  />
                }
                label="Remember me"
              />
              <Link
                component="button"
                variant="body2"
                onClick={() => setResetDialogOpen(true)}
                sx={{ textDecoration: 'none' }}
              >
                Forgot password?
              </Link>
            </Box>

            {error && (
              <Typography color="error" align="center">
                {error}
              </Typography>
            )}

            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 3,
                fontSize: '1.1rem',
                textTransform: 'none',
                background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
                boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)',
                '&:hover': {
                  background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.secondary.dark} 90%)`,
                },
              }}
            >
              Login
            </Button>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link
                component="button"
                variant="body2"
                onClick={() => {/* Handle create account */}}
                sx={{ textDecoration: 'none' }}
              >
                Create Account
              </Link>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Password Reset Dialog */}
      <Dialog open={resetDialogOpen} onClose={handleResetDialogClose}>
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {resetSuccess ? (
            <Typography color="success.main" sx={{ mt: 2 }}>
              Password reset email sent! Please check your inbox.
            </Typography>
          ) : (
            <>
              <Typography sx={{ mb: 2 }}>
                Enter your email address and we'll send you a link to reset your password.
              </Typography>
              <TextField
                autoFocus
                margin="dense"
                label="Email Address"
                type="email"
                fullWidth
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                error={!!resetError}
                helperText={resetError}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetDialogClose}>
            {resetSuccess ? 'Close' : 'Cancel'}
          </Button>
          {!resetSuccess && (
            <Button onClick={handleForgotPassword} disabled={loading}>
              Send Reset Link
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
} 