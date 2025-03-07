import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Grid,
  useTheme,
  Snackbar,
  Alert
} from '@mui/material';
import { 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  collection, 
  serverTimestamp,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebase';
import { Person } from '../types';

export default function PersonForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState<Omit<Person, 'id' | 'created_at' | 'updated_at'>>({
    first_name: '',
    last_name: '',
    phone_number: '',
    street_address: '',
    city: '',
    tq: '', // Taluk/Tehsil
    dist: '', // District
    state: '',
    country: 'India',
    postal_code: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const checkExistingPerson = async (firstName: string, lastName: string): Promise<boolean> => {
    try {
      // Create a query to check for existing people with the same first and last name
      const peopleRef = collection(db, 'People_Mng');
      const q = query(
        peopleRef,
        where('first_name', '==', firstName),
        where('last_name', '==', lastName)
      );
      
      const querySnapshot = await getDocs(q);
      
      // If we're editing an existing person, exclude the current person from the check
      if (id) {
        return querySnapshot.docs.some(doc => doc.id !== id);
      }
      
      // For new person, any match means a duplicate
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking existing person:', error);
      throw new Error('Failed to check for existing person');
    }
  };

  const fetchPerson = useCallback(async () => {
    if (id) {
      const docRef = doc(db, 'People_Mng', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone_number: data.phone_number || '',
          street_address: data.street_address || '',
          city: data.city || '',
          state: data.state || '',
          country: data.country || '',
          postal_code: data.postal_code || '',
          tq: data.tq || '',
          dist: data.dist || ''
        });
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchPerson();
    }
  }, [id, fetchPerson]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Check for existing person with same name
      const exists = await checkExistingPerson(formData.first_name, formData.last_name);
      if (exists) {
        setError('A person with this name already exists. Please use a different name.');
        return;
      }

      const timestamp = serverTimestamp();
      if (id) {
        await setDoc(doc(db, 'People_Mng', id), {
          ...formData,
          updated_at: timestamp
        }, { merge: true });
      } else {
        await addDoc(collection(db, 'People_Mng'), {
          ...formData,
          created_at: timestamp,
          updated_at: timestamp
        });
        // Clear form after successful addition
        setFormData({
          first_name: '',
          last_name: '',
          phone_number: '',
          street_address: '',
          city: '',
          tq: '',
          dist: '',
          state: '',
          country: 'India',
          postal_code: ''
        });
      }
      setShowSuccess(true);
      setError('');
    } catch (error) {
      console.error('Error saving person:', error);
      setError('Failed to save person. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            color: 'white',
            fontWeight: 'bold',
            textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
            mb: 4
          }}
        >
          {id ? 'Edit Person' : 'Add New Person'}
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            bgcolor: 'rgba(255,255,255,0.9)',
            p: 3,
            borderRadius: 2,
          }}
        >
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2}>
            {/* Personal Information */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                required
              />
            </Grid>

            {/* Address Information - Ordered as per Firestore structure */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="street_address"
                value={formData.street_address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Taluk/Tehsil"
                name="tq"
                value={formData.tq}
                onChange={handleChange}
                placeholder="Enter Taluk/Tehsil"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="District"
                name="dist"
                value={formData.dist}
                onChange={handleChange}
                placeholder="Enter District"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                name="country"
                value={formData.country}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                bgcolor: theme.palette.primary.main,
                color: 'white',
                '&:hover': {
                  bgcolor: theme.palette.primary.dark,
                },
              }}
            >
              {id ? 'Update' : 'Add'}
            </Button>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => navigate('/')}
              sx={{
                borderColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                },
              }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ width: '100%' }}>
          {id ? 'Person updated successfully!' : 'Person added successfully!'}
        </Alert>
      </Snackbar>
    </Container>
  );
} 