import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import PeopleList from './components/PeopleList';
import GroupList from './components/GroupList';
import PersonForm from './components/PersonForm';
import GroupForm from './components/GroupForm';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/AuthContext';
import GroupMembers from './components/GroupMembers';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#9c27b0',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <PeopleList />
                </PrivateRoute>
              }
            />
            <Route
              path="/groups"
              element={
                <PrivateRoute>
                  <GroupList />
                </PrivateRoute>
              }
            />
            <Route
              path="/person/add"
              element={
                <PrivateRoute>
                  <PersonForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/person/edit/:id"
              element={
                <PrivateRoute>
                  <PersonForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/group/add"
              element={
                <PrivateRoute>
                  <GroupForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/group/edit/:id"
              element={
                <PrivateRoute>
                  <GroupForm />
                </PrivateRoute>
              }
            />
            <Route
              path="/group/:id/members"
              element={
                <PrivateRoute>
                  <GroupMembers />
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
