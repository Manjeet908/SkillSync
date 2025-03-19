import 'dotenv/config'
import express from 'express';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Local Talent Discovery Platform API is running...');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
