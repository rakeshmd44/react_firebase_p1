import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { 
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar } from '@mui/x-data-grid';
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Person, Group } from '../types';

export default function GroupMembers() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id: groupId } = useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPeople, setAllPeople] = useState<Person[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchGroupAndMembers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch group data to get members array
      const groupDoc = await getDoc(doc(db, 'Groups', groupId!));
      if (!groupDoc.exists()) {
        console.error('Group not found');
        return;
      }

      const groupData = { id: groupDoc.id, ...groupDoc.data() } as Group;
      setGroup(groupData);

      // Fetch all people from People_Mng
      const peopleSnapshot = await getDocs(collection(db, 'People_Mng'));
      const peopleData = peopleSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Person[];
      
      setAllPeople(peopleData);

      // Set initial selected people from group members
      if (groupData.members) {
        setSelectedPeople(groupData.members);
      }

      // Filter current members
      const memberData = peopleData.filter(person => 
        groupData.members?.includes(person.id)
      );
      
      setMembers(memberData);
    } catch (error) {
      console.error('Error fetching group and members:', error);
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    if (groupId) {
      fetchGroupAndMembers();
    }
  }, [groupId, fetchGroupAndMembers]);

  const handleSaveMembers = async () => {
    try {
      setLoading(true);
      
      // Update group with new members
      await updateDoc(doc(db, 'Groups', groupId!), {
        members: selectedPeople,
        updated_at: new Date()
      });

      // Refresh the data
      await fetchGroupAndMembers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating members:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'first_name',
      headerName: 'First Name',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'last_name',
      headerName: 'Last Name',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'phone_number',
      headerName: 'Phone Number',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'street_address',
      headerName: 'Street Address',
      flex: 1.5,
      minWidth: 200,
    },
    {
      field: 'city',
      headerName: 'City',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'state',
      headerName: 'State',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'country',
      headerName: 'Country',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'postal_code',
      headerName: 'Postal Code',
      flex: 1,
      minWidth: 110,
    },
  ];

  if (!group) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
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
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
              {group.name} - Members ({members.length})
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, opacity: 0.9 }}>
              {group.description}
            </Typography>
          </Box>
          <Box>
          <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/groups')}
              sx={{
                mr: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white'
                }
              }}
            >
              Back to Groups

            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => setIsDialogOpen(true)}
              sx={{
                mr: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white'
                }
              }}
            >
              Edit Members
            </Button>
            
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <DataGrid
          rows={members}
          columns={columns}
          loading={loading}
          checkboxSelection
          disableRowSelectionOnClick
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          slots={{ toolbar: GridToolbar }}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          sx={{
            '& .MuiDataGrid-root': {
              backgroundColor: 'background.paper',
              borderRadius: 1,
            },
            '& .MuiDataGrid-cell:focus': {
              outline: 'none',
            },
            minHeight: 500,
          }}
          autoHeight
        />
      </Paper>

      {/* Edit Members Dialog */}
      <Dialog 
        open={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          Edit Group Members
        </DialogTitle>
        <DialogContent>
          <DataGrid
            rows={allPeople}
            columns={columns}
            loading={loading}
            checkboxSelection
            disableRowSelectionOnClick
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 10 },
              },
            }}
            pageSizeOptions={[5, 10, 25, 50]}
            slots={{ toolbar: GridToolbar }}
            slotProps={{
              toolbar: {
                showQuickFilter: true,
                quickFilterProps: { debounceMs: 500 },
              },
            }}
            sx={{
              height: 400,
              '& .MuiDataGrid-root': {
                backgroundColor: 'background.paper',
                borderRadius: 1,
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
            }}
            rowSelectionModel={selectedPeople}
            onRowSelectionModelChange={(newSelectionModel) => {
              setSelectedPeople(newSelectionModel as string[]);
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSaveMembers}
            variant="contained" 
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 