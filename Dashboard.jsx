import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Button, List, ListItem, TextField } from "@mui/material";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("username");
    if (storedUser) {
      setUser(storedUser);
      fetchItems();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const fetchItems = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/items");
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
    }
  };

  const handleAddItem = async () => {
    if (!newItem.trim()) return;
    try {
      const response = await fetch("http://localhost:5000/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newItem }),
      });
      const newItemData = await response.json();
      setItems([...items, newItemData]);
      setNewItem("");
    } catch (error) {
      console.error("Error adding item:", error);
    }
  };

  const handleUpdateItem = async (id, newName) => {
    try {
      await fetch(`http://localhost:5000/api/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName }),
      });
      setItems(items.map(item => 
        item.id === id ? { ...item, name: newName } : item
      ));
    } catch (error) {
      console.error("Error updating item:", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/items/${id}`, { method: "DELETE" });
      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  };

  return (
    <Container>
      <Typography variant="h2">Welcome, {user}!</Typography>
      
      <div style={{ margin: '20px 0' }}>
        <TextField
          label="New Item"
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          variant="outlined"
          style={{ marginRight: 10 }}
        />
        <Button variant="contained" onClick={handleAddItem}>
          Add Item
        </Button>
      </div>

      <List>
        {items.map(item => (
          <ListItem key={item.id}>
            <TextField
              value={item.name}
              onChange={(e) => handleUpdateItem(item.id, e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button
              variant="contained"
              color="error"
              onClick={() => handleDeleteItem(item.id)}
              style={{ marginLeft: 10 }}
            >
              Delete
            </Button>
          </ListItem>
        ))}
      </List>

      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          localStorage.clear();
          navigate("/login");
        }}
      >
        Logout
      </Button>
    </Container>
  );
};

export default Dashboard;
