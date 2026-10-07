import React, { lazy } from 'react'
import { Route } from 'react-router-dom'
import { ConsumerLayout } from './layout/ConsumerLayout'
import { FocusedLayout } from './layout/FocusedLayout'

const HomePage = lazy(() => import('./pages/home/HomePage'))
const ExplorePage = lazy(() => import('./pages/explore/ExplorePage'))
const DropDetailsPage = lazy(() => import('./pages/drop-details/DropDetailsPage'))
const ProductDetailsPage = lazy(() => import('./pages/product-details/ProductDetailsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'))
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'))
const AuthScreen = lazy(() =>
  import('@/features/auth/components/AuthScreen').then((m) => ({ default: m.AuthScreen }))
)

export const consumerRoutes = (
  <>
    {/* Standard Consumer Experience with Top Header & Bottom Nav */}
    <Route element={<ConsumerLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/drops/:id" element={<DropDetailsPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/activity" element={<ActivityPage />} />
    </Route>

    {/* Focused Flows (Checkout, Auth) without Bottom Navigation */}
    <Route element={<FocusedLayout />}>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/auth" element={<AuthScreen />} />
    </Route>
  </>
)
