import { Router } from 'express';
const router = Router();
import { get, getOne, getSearch, create, update, remove, updateMany, excelImport } from '../controllers/orders.controller.js';
import { receiveOnlyMulter } from '../utils/multerUpload.js';


router.post('/', create);

router.post('/excelImport', receiveOnlyMulter.single('file'), excelImport);

router.get('/', get);

router.get('/:id', getOne);

router.get('/search/:searchKey', getSearch);

router.put('/:id', update);

router.patch('/', updateMany)

router.delete('/:id', remove);

export default router;