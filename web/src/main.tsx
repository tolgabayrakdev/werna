import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

import SignIn from '@/pages/auth/sign-in'
import SignUp from '@/pages/auth/sign-up'
import ForgotPassword from '@/pages/auth/forgot-password'
import AppLayout from '@/layouts/app-layout'
import AppIndex from '@/pages/app/index'
import Settings from '@/pages/app/settings'

const router = createBrowserRouter([
    {
        path: "/sign-in",
        element: <SignIn />
    },
    {
        path: "/sign-up",
        element: <SignUp />
    },
    {
        path: "/forgot-password",
        element: <ForgotPassword />
    },
    {
        path: "/",
        element: <AppLayout />,
        children: [
            {
                index: true,
                element: <AppIndex />
            },
            {
                path: "settings",
                element: <Settings />
            }
        ]
    }
])

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <Toaster />
        <RouterProvider router={router} />
    </StrictMode>,
)