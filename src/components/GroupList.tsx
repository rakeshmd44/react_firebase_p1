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
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridToolbar, GridRowSelectionModel, GridRenderCellParams } from '@mui/x-data-grid';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { Group } from '../types';

export default function GroupList() {
  const theme = useTheme();
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroups, setSelectedGroups] = useState<GridRowSelectionModel>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'Groups'));
      const groupsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Group[];
      setGroups(groupsData);
    } catch (error) {
      console.error('Error fetching groups:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'Groups', id));
      await fetchGroups();
      setSelectedGroups([]);
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      await Promise.all(
        selectedGroups.map((id) => deleteDoc(doc(db, 'Groups', id.toString())))
      );
      await fetchGroups();
      setSelectedGroups([]);
    } catch (error) {
      console.error('Error deleting selected groups:', error);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
      minWidth: 130,
    },
    {
      field: 'description',
      headerName: 'Description',
      flex: 2,
      minWidth: 200,
    },
    {
      field: 'created_at',
      headerName: 'Created At',
      flex: 1,
      minWidth: 180,
      valueFormatter: ({ value }: { value: any }) => {
        return value?.toDate?.()?.toLocaleString() || '';
      },
    },
    {
      field: 'updated_at',
      headerName: 'Updated At',
      flex: 1,
      minWidth: 180,
      valueFormatter: ({ value }: { value: any }) => {
        return value?.toDate?.()?.toLocaleString() || '';
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 1,
      minWidth: 150,
      sortable: false,
      filterable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Box>
          <Tooltip title="Manage Members">
            <IconButton
              size="small"
              onClick={() => navigate(`/group/${params.row.id}/members`)}
              sx={{ color: theme.palette.info.main }}
            >
              <PeopleIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={() => navigate(`/group/edit/${params.row.id}`)}
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
            Groups
          </Typography>
          <Box>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{
                mr: 2,
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white'
                }
              }}
            >
              Back to People
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/group/add')}
              sx={{
                bgcolor: 'rgba(255,255,255,0.9)',
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'white'
                }
              }}
            >
              Add Group
            </Button>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {selectedGroups.length > 0 && (
            <Box>
              <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
                {selectedGroups.length} {selectedGroups.length === 1 ? 'group' : 'groups'} selected
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
          rows={groups}
          columns={columns}
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
          checkboxSelection
          disableRowSelectionOnClick={false}
          autoHeight
          onRowSelectionModelChange={(newSelectionModel) => {
            setSelectedGroups(newSelectionModel);
          }}
          rowSelectionModel={selectedGroups}
        />
      </Paper>
    </Container>
  );
} 