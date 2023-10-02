import React, {useEffect, useState} from 'react';
import axios from "axios";
import {Link} from "react-router-dom";

const Home = () => {
    const [auth, setAuth] = useState(false);
    const [message, setMessage] = useState('')
    const [name, setName] = useState('')

    axios.defaults.withCredentials = true;

    useEffect(() => {
        axios.get('http://localhost:5000')
            .then(res => {
                if (res.data.Status === 'Успешно!') {
                    setAuth(true)
                    setName(res.data.name)
                } else {
                    setAuth(false)
                    setMessage(res.data.Error)
                }
            })
            .then(err => console.log(err));
    }, []);

    const handleDelete = () => {
        axios.get('http://localhost:5000/logout')
            .then(res => {
                location.reload();
            }).catch(err => console.log(err));
    }

    return (
        <div className='d-flex justify-content-center align-items-center bg-dark vh-100'>
            {
                auth ?
                    <div className='bg-dark p-3 rounded w-25 d-flex flex-column align-items-center'>
                        <h3 className='text-success'>Вы авторизовались! {name}</h3>
                        <button
                            className='btn btn-light mt-3'
                            onClick={handleDelete}>
                            Выйти
                        </button>
                    </div>
                    :
                    <div className='bg-dark p-3 rounded w-25 d-flex flex-column align-items-center'>
                        <h3 className='text-danger'>{message}</h3>
                        <Link
                            to='/login'
                            className='btn btn-light mt-3'>
                            Войти
                        </Link>
                    </div>
            }
        </div>
    );
};

export default Home;