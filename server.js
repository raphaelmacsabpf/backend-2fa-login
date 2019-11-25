const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const loginController = require('./lib/controllers/login');
const dashboardController = require('./lib/controllers/dashboard');

const app = express();
const router = express.Router();


app.use(cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: '100'
}));

app.use(bodyParser.json());
app.use(router);

router.post('/login', loginController.emailLogin);
router.post('/verify-2fa', loginController.verify2FA);
router.get('/dashboard', dashboardController.get);

const server = app.listen(3001, () => {
    console.log(`Server running on port: ${server.address().port}`);
});