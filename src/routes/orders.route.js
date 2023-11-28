import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, updateMany } from '../controllers/orders.controller.js';


router.post('/', create);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.patch('/', updateMany)

router.delete('/:id', remove);

export default router;