import express from 'express'
import { 
    newUser,
    getAllUsers,
    getUser,
    deleteUser
} from '../controllers/user.js'

const app = express.Router()

// Routes - /api/v1/user/new
app.post('/new', newUser)

// Routes - /api/v1/user/all
app.get('/all', getAllUsers)

// Routes - /api/v1/user/dynamicId
app.route('/:id').get(getUser).delete(deleteUser)

export default app