import { Router } from 'express';
import { createDeposit, depositForm } from '../controllers/controller';

const mainRouter = Router();
mainRouter.post('/',createDeposit);
mainRouter.get('/', depositForm);
export default mainRouter;