import { useState } from "react";

const App = () => {
  const [formData, setFormData] = useState({
    "username": "", "email": '', "password": "",
    "confirmPassword": ''
  })
  const [message, setMessage] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation check
    if (formData.password !== formData.confirmPassword) {
      setMessage("Error: Passwords do not match!");
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;


      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage("Success! Welcome aboard.")
        window.location.href = "/api/v1/dashboard"
      } else {
        setMessage(`Error: ${data.detail || "Something went wrong"}`)
      }
    } catch (error) {
      setMessage("Network error. Is the fastapi server running?")
    }
  }

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', fontFamily: 'sans-serif' }}>
      <h2>Sign Up</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="username"
          name="username"
          placeholder="Username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <input type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <input type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <button type="submit">Signup</button>

      </form>
      {message && <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>{message}</p>}
    </div>
  )

}


export default App;