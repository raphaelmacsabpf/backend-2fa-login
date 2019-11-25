const Base64 = require('js-base64').Base64;
const userDb = require('../db/user.js');

class DashboardController {
    get(req, res) {
        const authorizationHeader = req.header("Authorization");
        const token = JSON.parse(Base64.decode(authorizationHeader));

        const userInDatabase = userDb.getById(token.userId);
        const userData = {
            name: userInDatabase.name,
            email: userInDatabase.email,
            phone: userInDatabase.phone
        }

        res.json(userData);
    }
}

module.exports = new DashboardController();
