import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [inventory, setInventory] = useState({
    item: "",
    quantity: "",
  });

  const [items, setItems] = useState([]);
  const [editId, setEditId] = useState(null); // Track by DB _id instead of index

  const API_URL = "http://localhost:5000/api/inventory";

  // Fetch items from database on component mount
  useEffect(() => {
    fetchItems();
  }, []);

  async function fetchItems() {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  function handleChange(e) {
    setInventory({
      ...inventory,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (editId) {
      // Edit existing row in database
      try {
        const response = await fetch(`${API_URL}/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inventory),
        });
        const updatedItem = await response.json();
        
        // Update local state
        const copy = items.map((item) => 
          item._id === editId ? updatedItem : item
        );
        setItems(copy);
        setEditId(null);
      } catch (error) {
        console.error("Error updating item:", error);
      }
    } else {
      // Add new row to database
      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inventory),
        });
        const savedItem = await response.json();
        
        // Update local state with the returned DB object (which includes the new _id)
        setItems([...items, savedItem]);
      } catch (error) {
        console.error("Error saving item:", error);
      }
    }

    // Clear form
    setInventory({
      item: "",
      quantity: "",
    });
  }

  async function deleteItem(id) {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });
      // Remove from local state
      setItems(items.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Error deleting item:", error);
    }
  }

  function editItem(item) {
    // Populate form with current item values
    setInventory({
      item: item.item,
      quantity: item.quantity,
    });
    setEditId(item._id);
  }

  return (
    <div>
      <h1>WEST WING INVENTORY</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="item"
          placeholder="Item"
          value={inventory.item}
          onChange={handleChange}
        />

        <input
          type="text"
          name="quantity"
          placeholder="Quantity"
          value={inventory.quantity}
          onChange={handleChange}
        />

        <button type="submit">
          {editId ? "Update" : "Submit"}
        </button>
      </form>

      <h2>Inventory</h2>

      {/* Note: Using thing._id as the key now */}
      {items.map((thing) => (
        <div key={thing._id} className="row">
          <span>{thing.quantity}</span>
          <span>{thing.item}</span>

          <button onClick={() => editItem(thing)}>
            Edit
          </button>

          <button onClick={() => deleteItem(thing._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default App;