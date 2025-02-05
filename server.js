
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

const DATA_FILE = './data.json';

function readData() {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    } else {
        return { restaurants: [] };
    }
}

function saveData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
});

app.get('/api/products/:restaurant', (req, res) => {
    const data = readData();
    const restaurant = req.params.restaurant;
    const restaurantData = data.restaurants.find(r => r.name === restaurant);

    if (restaurantData) {
        res.json(restaurantData.products);
    } else {
        res.status(404).json({ message: 'Restaurante no encontrado' });
    }
});

app.post('/api/products', (req, res) => {
    const { restaurant, name, price, image_url } = req.body;
    const data = readData();

    let restaurantData = data.restaurants.find(r => r.name === restaurant);
    if (!restaurantData) {
        restaurantData = { name: restaurant, products: [] };
        data.restaurants.push(restaurantData);
    }

    const newProduct = { id: Date.now(), name, price, image_url };
    restaurantData.products.push(newProduct);
    saveData(data);

    res.json({ message: 'Producto agregado', product: newProduct });
});

app.delete('/api/products/:restaurant/:id', (req, res) => {
    const { restaurant, id } = req.params;
    const data = readData();

    const restaurantData = data.restaurants.find(r => r.name === restaurant);
    if (restaurantData) {
        restaurantData.products = restaurantData.products.filter(p => p.id != id);
        saveData(data);
        res.json({ message: 'Producto eliminado' });
    } else {
        res.status(404).json({ message: 'Restaurante no encontrado' });
    }
});

app.listen(port, () => {
    console.log(`Servidor corriendo en http://localhost:${port}`);
});
