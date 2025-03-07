import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Button,
  Box,
  IconButton,
  Tooltip,
  useTheme,
  Paper,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Group as GroupIcon,
  PersonAdd as PersonAddIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar, GridRowSelectionModel } from '@mui/x-data-grid';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Person } from '../types';
import { useAuth } from '../contexts/AuthContext';

export default function PeopleList() {
  const theme = useTheme();
  const [people, setPeople] = useState<Person[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<GridRowSelectionModel>([]);
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    fetchPeople();
  }, []);

  const fetchPeople = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'People_Mng'));
      const peopleData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Person[];
      setPeople(peopleData);
    } catch (error) {
      console.error('Error fetching people:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'People_Mng', id));
      await fetchPeople();
      setSelectedPeople([]);
    } catch (error) {
      console.error('Error deleting person:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedPeople.map((id) => deleteDoc(doc(db, 'People_Mng', id.toString())))
      );
      await fetchPeople();
      setSelectedPeople([]);
    } catch (error) {
      console.error('Error deleting selected people:', error);
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
      field: 'tq',
      headerName: 'Taluk/Tehsil',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'dist',
      headerName: 'District',
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
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/person/edit/${params.row.id}`)}
              sx={{ color: theme.palette.primary.main }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDelete(params.row.id)}
              sx={{ color: theme.palette.error.main }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

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
          <Typography variant="h4" fontWeight="bold" sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.2)' }}>
            People List
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                mr: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.error.main,
                '&:hover': {
                  bgcolor: 'white'
                }
              }}
            >
              Logout
            </Button>
            <Button
              variant="contained"
              startIcon={<GroupIcon />}
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
              Groups
            </Button>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={() => navigate('/person/add')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white'
                }
              }}
            >
              Add Person
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedPeople.length > 0 && (
            <Box>
              <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
                {selectedPeople.length} {selectedPeople.length === 1 ? 'person' : 'people'} selected
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </Box>
          )}
        </Box>
        <DataGrid
          rows={people}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
            columns: {
              columnVisibilityModel: {
                state: false,
                country: false,
              },
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
          checkboxSelection
          disableRowSelectionOnClick={false}
          autoHeight
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectedPeople(newSelectionModel);
          }}
          rowSelectionModel={selectedPeople}
        />
      </Paper>
    </Container>
  );
} 