import express from 'express';
import mysql from 'mysql';
import cors from 'cors';
import jwt, {decode} from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cookieParser from 'cookie-parser';

const salt = 10;

const app = express();
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5001'],
    methods: ['POST', 'GET'],
    credentials: true
}));
app.use(cookieParser());

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "auth-token"
})

const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json({Error: 'Вы не авторизованы!'});
    } else {
        jwt.verify(token, 'jwt-secret-key', (err, decoded) => {
            if (err) {
                return res.json({Error: 'Ошибка при проверке токена!'});
            } else {
                req.name = decoded.name;
                next();
            }
        })
    }
}

app.get('/', verifyUser, (req, res) => {
    return res.json({Status: 'Успешно!', name: req.name});
})

app.post('/register', (req, res) => {
    const sql = 'INSERT INTO users (`username`, `email`, `password`) VALUES (?)';
    bcrypt.hash(req.body.password.toString(), salt, (err, hash) => {
        if (err) return res.json({Error: 'Ошибка хеширования пароля!'});
        const values = [
            req.body.name,
            req.body.email,
            hash
        ]
        db.query(sql, [values], (err, result) => {
            if (err) return res.json({Error: 'Ошибка при добавлении данных на сервер!'});
            return res.json({Status: 'Успешно!'});
        })
    })

})

app.post('/login', (req, res) => {
    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [req.body.email], (err, data) => {
        if (err) return res.json({Error: 'Ошибка авторизации!'});
        if (data.length > 0) {
            bcrypt.compare(req.body.password.toString(), data[0].password, (err, response) => {
                if (err) return res.json({Error: 'Пароли не совпадают!'});
                if (response) {
                    const name = data[0].name;
                    const token = jwt.sign({name}, 'jwt-secret-key', {expiresIn: '1d'});
                    res.cookie('token', token);
                    return res.json({Status: 'Успешно!'});
                } else {
                    return res.json({Error: 'Неправильный пароль!'});
                }
            })
        } else {
            return res.json({Error: 'Такого email не существует!'});
        }
    })
})

app.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({Status: 'Успешно!'})
})

app.listen(5000, () => {
    console.log("Сервер запущен...");
})