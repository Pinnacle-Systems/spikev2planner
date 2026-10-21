import multer from 'multer';
import mimeDb from 'mime-db'

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads")
    },

    filename: (req, file, cb) => {
        cb(null, `${Date.now()}${file.originalname}.${mimeDb[file.mimetype].extensions?.[0]}`)
    }
})
const multerUpload = multer({ storage })

export const receiveOnlyMulter = multer()

export default multerUpload