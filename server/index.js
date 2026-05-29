const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create the Mongoose Schema & Model
const inventorySchema = new mongoose.Schema({
  item: String,
  quantity: String
});
const Inventory = mongoose.model('Inventory', inventorySchema);

// The "Hello World" Route
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from the MERN Server!" });
});

// Database Connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.log("DB Connection Error:", err));

// Item Submission (POST)
app.post('/api/inventory', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Item Get (GET)
app.get('/api/inventory', async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Item Update (PUT)
app.put('/api/inventory/:id', async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true } // returns the newly updated document
    );
    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Item Delete (DELETE)
app.delete('/api/inventory/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: "Item successfully deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
