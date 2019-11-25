const Totalvoice = require('totalvoice-node');
const Base64 = require('js-base64').Base64;
const userDb = require('../db/user.js');

class LoginController {
    emailLogin(req, res) {
        const totalvoiceClient = new Totalvoice(process.env.TOTALVOICE_ACCESS_TOKEN);
        const userInDatabase = userDb.getByLogin(req.body.email, req.body.password);

        if(userInDatabase == undefined) {
            res.status(404).json({message: "Invalid credentials"});
            return;
        }

        const token = {
            type: "login",
            userId: userInDatabase.id,
            email: userInDatabase.email, 
            sign: "0123456ABCDEF"
        };

        totalvoiceClient.verificacao.enviar(userInDatabase.phone, "app-top", 5, false)
        .then(data => {
            token.type = '2fa-sent';
            token.twoFactorVerificationId = data.dados.id;
            const base64Token = Base64.encode(JSON.stringify(token));
            res.json({message: "Authentication success, waiting 2FA validation!", token: base64Token});
        })
        .catch(error => {
            res.status(500).json({message: "Error sending 2FA PIN"});
        });
    }

    verify2FA(req, res) {
        const totalvoiceClient = new Totalvoice(process.env.TOTALVOICE_ACCESS_TOKEN);
        const token = JSON.parse(Base64.decode(req.header('Authorization')));
        const userInDatabase = userDb.getById(token.userId);
        const pin = req.body.pin;
    
        if(token.type != '2fa-sent') {
            res.status(409).json({message: "Invalid token type, expected type: 2fa-sent"});
            return;
        }

        totalvoiceClient.verificacao.buscar(token.twoFactorVerificationId, pin)
        .then((data) => {
            const permanentToken = {
                type: "permanent",
                userId: userInDatabase.id,
                email: userInDatabase.email,
                sign: "0123456ABCDEF"
            };

            const base64Token = Base64.encode(JSON.stringify(permanentToken));
            res.status(201).json({message: `2FA validation success`, permanentToken: base64Token});
        })
        .catch(error => {
            res.status(401).json({message: "Invalid 2FA PIN"});
        });
    }
}

module.exports = new LoginController();
