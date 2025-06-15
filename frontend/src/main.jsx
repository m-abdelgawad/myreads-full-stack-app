import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import router from './routes/routes.jsx'
import './assets/css/styles.css'
import {AuthProvider} from "./context/AuthContext.jsx";
import {BooksProvider} from "./context/BooksContext.jsx";

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <AuthProvider>
          <BooksProvider>
              <RouterProvider router={router} />
          </BooksProvider>
      </AuthProvider>
  </StrictMode>,
)