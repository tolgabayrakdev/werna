import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { Toaster } from '@/components/ui/sonner'

import SignIn from "@/pages/auth/sign-in"
import SignUp from "@/pages/auth/sign-up"
import ForgotPassword from "@/pages/auth/forgot-password"
import ResetPassword from "@/pages/auth/reset-password"
import AppLayout from "@/layouts/app-layout"
import AppIndex from "@/pages/app/index"
import Settings from "@/pages/app/settings"
import LinksPage from "@/pages/app/links"
import FeedbacksPage from "@/pages/app/feedbacks"
import FeedbackForm from "@/pages/feedback/form"
import { ThemeProvider } from './providers/theme-provider'

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
    path: "/reset-password",
    element: <ResetPassword />
  },
  {
    path: "/f/:slug",
    element: <FeedbackForm />
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
        path: "links",
        element: <LinksPage />
      },
      {
        path: "feedbacks",
        element: <FeedbacksPage />
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
    <ThemeProvider storageKey='vite-ui-theme'>
      <Toaster position="top-center" />
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
