import React, { useState } from 'react'
import authService from '../appwrite/auth'
import { Link, useNavigate } from 'react-router-dom'
import { login } from '../store/authSlice'
import { Button, Input, Logo } from './index.js'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import './signup.css'  // Import custom CSS

function Signup() {
    const navigate = useNavigate()
    const [error, setError] = useState("")
    const dispatch = useDispatch()
    const { register, handleSubmit } = useForm()

    const create = async (data) => {
        setError("")
        try {
            const userData = await authService.createAccount(data)
            if (userData) {
                const userData = await authService.getCurrentUser()
                if (userData) dispatch(login(userData))
                navigate("/")
            }
        } catch (error) {
            setError(error.message)
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-box">
                <div className="logo-container">
                    <Logo width="100%" />
                </div>

                <h1 className="title">Welcome</h1>
                <h2 className="subtitle">Sign up to create account</h2>
                <p className="signup-text">
                    Already have an account?&nbsp;
                    <Link to="/login" className="signin-link">Sign In</Link>
                </p>

                {error && <p className="error-message">{error}</p>}

                <form onSubmit={handleSubmit(create)} className="signup-form">
                    <div className="form-fields">
                        <Input
                            label="Full Name: "
                            placeholder="Enter your full name"
                            {...register("name", { required: true })}
                        />
                        <Input
                            label="Email: "
                            placeholder="Enter your email"
                            type="email"
                            {...register("email", {
                                required: true,
                                validate: {
                                    matchPatern: (value) =>
                                        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value) ||
                                        "Email address must be a valid address",
                                }
                            })}
                        />
                        <Input
                            label="Password: "
                            type="password"
                            placeholder="Enter your password"
                            {...register("password", { required: true })}
                        />
                        <Button type="submit" className="submit-button">Create Account</Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default Signup