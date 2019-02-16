import * as express from 'express';

import AuthController from './auth.controller';

class Auth {
    public router: express.Router;

    constructor () {
        const controller = new AuthController();

        this.router = express.Router();

        this.router.route('/');

        this.router.get('/', (req, res) => {
            const response = controller.testResponse();
            res.json({
                response
            });
        });
    }
}

export default new Auth().router;