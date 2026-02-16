import React from 'react'
import { Link, useNavigate } from 'react-router'
import { usePuterStore } from '~/lib/puter'

const Navbar = () => {
  const { auth } = usePuterStore();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await auth.signOut();
    navigate('/auth');
  }

  return (
    <nav className="navbar">
      <Link to="/">
        <p className='text-2xl font-bold text-gradient'>AI Resume Analyzer</p>
      </Link>
      <div className="flex gap-4 items-center">
        {auth.isAuthenticated && (
          <>
            <Link to="/upload" className="primary-button w-fit">
              Upload Resume
            </Link>
            <button 
              onClick={handleSignOut}
              className="logout-button"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  )
}

export default Navbar