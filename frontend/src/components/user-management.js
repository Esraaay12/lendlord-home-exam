import React, { useMemo, useState, useEffect } from 'react';
import { useTable, useSortBy, useFilters } from 'react-table';
import Select from 'react-select';
import axios from 'axios';
import { Modal, Box, Button, TextField, MenuItem, IconButton, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { styled } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, formatDistanceToNow } from 'date-fns';
import './user-management.css';

const BASE_URL = 'http://localhost:3000';

const PremiumButton = styled(Button)({
  backgroundColor: '#1e88e5',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#1565c0',
  },
});

const StyledBox = styled(Box)({
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 500,
  bgcolor: 'background.paper',
  boxShadow: 24,
  padding: '20px',
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    dateStarted: '',
    salary: '',
    role: 'Worker',
    manager: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const usersResponse = await axios.get(`${BASE_URL}/users`);
      setUsers(usersResponse.data);
    };
    fetchData();
  }, []);

  const handleCreate = () => {
    setIsModalOpen(true);
    setIsEditMode(false);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      dateStarted: '',
      salary: '',
      role: 'Worker',
      manager: ''
    });
  };

  const handleEdit = (user) => {
    setIsModalOpen(true);
    setIsEditMode(true);
    setCurrentUserId(user._id);
    console.log('Handle Edit User : ', user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      dateStarted: format(new Date(user.dateStarted), 'yyyy-MM-dd'),
      salary: user.salary,
      role: user.role,
      manager: user.manager || ''
    });
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${BASE_URL}/user/${userToDelete}`);
      setUsers(users.filter(user => user._id !== userToDelete));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting user', error);
    }
  };

  const openDeleteDialog = (userId) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`${BASE_URL}/user/${currentUserId}`, formData);
      } else {
        await axios.post(`${BASE_URL}/user`, formData);
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error('Error saving user', error);
    }
  };

  const columns = useMemo(() => [
    { Header: 'First Name', accessor: 'firstName' },
    { Header: 'Last Name', accessor: 'lastName' },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Role', accessor: 'role' },
    { Header: 'Date Started', accessor: 'dateStarted', Cell: ({ value }) => format(new Date(value), 'yyyy-MM-dd') },
    { Header: 'Salary', accessor: 'salary' },
    { Header: 'Manager', accessor: 'manager', Cell: ({ value }) => (value ? value : 'N/A') },
    {
      Header: 'Actions',
      accessor: 'actions',
      Cell: ({ row }) => (
        <div>
          <IconButton onClick={() => handleEdit(row.original)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => openDeleteDialog(row.original._id)} color="secondary">
            <DeleteIcon />
          </IconButton>
        </div>
      )
    }
  ], []);

  const data = useMemo(() => users, [users]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setFilter
  } = useTable({ columns, data }, useFilters, useSortBy);

  return (
    <div style={{ padding: '30px' }}>
      <PremiumButton variant="contained" onClick={handleCreate} style={{ marginBottom: '20px' }}>
        Add
      </PremiumButton>
      <Select
        options={users.filter(user => user.role === 'Manager').map(manager => ({ value: manager.firstName + ' ' + manager.lastName, label: manager.firstName + ' ' + manager.lastName }))}
        placeholder="Filter by Manager"
        onChange={option => setFilter('manager', option ? option.value : '')}
        isClearable
      />
      <table {...getTableProps()}>
        <thead>
          {headerGroups.map(headerGroup => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map(column => (
                <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                  {column.render('Header')}
                  {column.isSorted
                    ? column.isSortedDesc
                      ? ' 🔽'
                      : ' 🔼'
                    : ''}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map(row => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map(cell => (
                  <td {...cell.getCellProps()}>
                    {cell.render('Cell')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      <Modal
        open={isModalOpen}
        onClose={closeModal}
        aria-labelledby="add-user-modal-title"
        aria-describedby="add-user-modal-description"
      >
        <StyledBox sx={{ bgcolor: 'white' }}>
          <h1 id="add-user-modal-title">{isEditMode ? 'Edit User' : 'Add New User'}</h1>
          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Date Started"
              name="dateStarted"
              type="date"
              value={formData.dateStarted}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              label="Salary"
              name="salary"
              type="number"
              value={formData.salary}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              select
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              fullWidth
              margin="normal"
            >
              <MenuItem value="Worker">Worker</MenuItem>
              <MenuItem value="Driver">Driver</MenuItem>
              <MenuItem value="Manager">Manager</MenuItem>
            </TextField>
            {formData.role !== 'Manager' && (
              <TextField
                select
                label="Manager"
                name="manager"
                value={formData.manager}
                onChange={handleChange}
                fullWidth
                margin="normal"
              >
                <MenuItem value="">Select Manager</MenuItem>
                {users.filter(user => user.role === 'Manager').map(manager => (
                  <MenuItem key={manager._id} value={`${manager.firstName} ${manager.lastName}`}>{manager.firstName} {manager.lastName}</MenuItem>
                ))}
              </TextField>
            )}
            <PremiumButton type="submit" variant="contained" fullWidth>
              {isEditMode ? 'Update' : 'Submit'}
            </PremiumButton>
          </form>
        </StyledBox>
      </Modal>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={closeDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Deletion"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this user? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDelete} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default UserManagement;
