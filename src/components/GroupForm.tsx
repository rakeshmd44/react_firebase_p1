import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  useTheme,
} from '@mui/material';
import { doc, getDoc, setDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Group } from '../types';

export default function GroupForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [formData, setFormData] = useState<Omit<Group, 'id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    members: []
  });

  const fetchGroup = useCallback(async () => {
    if (id) {
      const docRef = doc(db, 'Groups', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          name: data.name || '',
          description: data.description || '',
          members: data.members || []
        });
      }
    }
  }, [id]);

  useEffect(() => {
    if (id) {
      fetchGroup();
    }
  }, [id, fetchGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const groupId = id || doc(collection(db, 'Groups')).id;
      const timestamp = serverTimestamp();
      
      await setDoc(doc(db, 'Groups', groupId), {
        ...formData,
        updated_at: timestamp,
        created_at: id ? (await getDoc(doc(db, 'Groups', groupId))).data()?.created_at || timestamp : timestamp,
      });
      
      navigate('/groups');
    } catch (error) {
      console.error('Error saving group:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper 
        sx={{
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          borderRadius: 2,
          p: 3,
          mb: 4,
          color: 'white',
          boxShadow: '0 3px 5px 2px rgba(0, 0, 0, .3)'
        }}
      >
        <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
          {id ? 'Edit Group' : 'Create Group'}
        </Typography>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            margin="normal"
            multiline
            rows={4}
            required
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              type="submit"
            >
              {id ? 'Update' : 'Create'} Group
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/groups')}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 