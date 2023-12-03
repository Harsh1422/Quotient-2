import React, { useState, useEffect } from 'react';
import { Table, FormControl, InputGroup, Button } from 'react-bootstrap';
import { FaSearch, FaEdit, FaTrash } from 'react-icons/fa';
import axios from 'axios';
import './App.css';
const PAGE_SIZE = 10;
const App = () => {
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ]);
  const [loading,setLoading]=useState(true);

  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState('');
useEffect(()=>{
  const dataa=async()=>
  {
    const response=await axios.get("https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json");;
    const data=response.data;
    setTimeout(() => {
      setUsers(data);
      setLoading(false);
    }, 2000);
  }
  dataa();
},[])
  useEffect(() => {
      const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchText.toLowerCase()) ||
        user.email.toLowerCase().includes(searchText.toLowerCase()) ||
        user.role.toLowerCase().includes(searchText.toLowerCase())
    );
    if(!loading)
    {
      setFilteredUsers(filtered);
    }
    
    setCurrentPage(1); 
  }, [users, searchText]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  const handleDeleteSelected = () => {
    const updatedUsers = users.filter((user) => !selectedRows.includes(user.id));
    setUsers(updatedUsers);
    setSelectedRows([]); 
  };

  const handleSelectAll = () => {
    setSelectedRows((prevSelected) =>
      prevSelected.length === filteredUsers.length ? [] : filteredUsers.map((user) => user.id)
    );
  };

  const handleRowSelect = (userId) => {
    setSelectedRows((prevSelected) =>
      prevSelected.includes(userId)
        ? prevSelected.filter((id) => id !== userId)
        : [...prevSelected, userId]
    );
  };

  const handleDelete = (userId) => {
    const updatedUsers = users.filter((user) => user.id !== userId);
    setUsers(updatedUsers);
  };

  const handleEdit = (userId, field, value) => {
    const updatedUsers = users.map((user) =>
      user.id === userId ? { ...user, [field]: value } : user
    );
    setUsers(updatedUsers);
  };

  return (
    <div className="app-container">
      <InputGroup className="mb-3 search-bar">
        <FormControl
          placeholder="Search..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Button variant="outline-secondary" onClick={() => handlePageChange(1)}>
          <FaSearch />
        </Button>
      </InputGroup>
      {loading?(<p>Loading.....</p>):(<Table striped bordered hover className="table-container">
        <thead>
          <tr>
            <th>
              <input
                type="checkbox"
                checked={selectedRows.length === filteredUsers.length}
                onChange={handleSelectAll}
              />
            </th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers
            .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
            .map((user) => (
              <tr key={user.id} className={selectedRows.includes(user.id) ? 'selected-row' : ''}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(user.id)}
                    onChange={() => handleRowSelect(user.id)}
                  />
                </td>
                <td>
                  <EditableCell
                    value={user.name}
                    onSave={(value) => handleEdit(user.id, 'name', value)}
                  />
                </td>
                <td>
                  <EditableCell
                    value={user.email}
                    onSave={(value) => handleEdit(user.id, 'email', value)}
                  />
                </td>
                <td>
                  <EditableCell
                    value={user.role}
                    onSave={(value) => handleEdit(user.id, 'role', value)}
                  />
                </td>
                <td>
                  <Button variant="link" className="delete" onClick={() => handleDelete(user.id)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </Table>)}
      

      <div className="pagination">
        <Button variant="secondary" onClick={() => handlePageChange(1)}>
          First
        </Button>
        <Button variant="secondary" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        {[...Array(Math.ceil(filteredUsers.length / PAGE_SIZE)).keys()].map((page) => (
          <Button
            key={page + 1}
            variant="secondary"
            onClick={() => handlePageChange(page + 1)}
            active={page + 1 === currentPage}
          >
            {page + 1}
          </Button>
        ))}
        <Button
          variant="secondary"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === Math.ceil(filteredUsers.length / PAGE_SIZE)}
        >
          Next
        </Button>
        <Button
          variant="secondary"
          onClick={() => handlePageChange(Math.ceil(filteredUsers.length / PAGE_SIZE))}
        >
          Last
        </Button>
      </div>

      <Button variant="danger" className="buttonFinal" onClick={handleDeleteSelected}>
        <FaTrash /> Delete Selected
      </Button>
    </div>
  );
};

const EditableCell = ({ value, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(value);

  const handleEditClick = () => {
    setIsEditing(true);
    setEditedValue(value);
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave(editedValue);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    setEditedValue(value);
  };

  return (
    <div className="editable-cell">
      {isEditing ? (
        <>
          <input
            type="text"
            value={editedValue}
            onChange={(e) => setEditedValue(e.target.value)}
          />
          <Button variant="success" className="save" onClick={handleSaveClick}>
            Save
          </Button>
          <Button variant="secondary" className="cancel" onClick={handleCancelClick}>
            Cancel
          </Button>
        </>
      ) : (
        <>
          <span>{value}</span>
          <Button variant="link" className="edit" onClick={handleEditClick}>
            <FaEdit />
          </Button>
        </>
      )}
    </div>
  );
};

export default App;
