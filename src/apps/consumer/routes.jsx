import { lazy } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { UI_FEATURES } from '@/shared/config/features'
import { ConsumerLayout } from './layout/ConsumerLayout'
import { FocusedLayout } from './layout/FocusedLayout'

const HomePage = lazy(() => import('./pages/home/HomePage'))
const ExplorePage = lazy(() => import('./pages/explore/ExplorePage'))
const DropDetailsPage = lazy(() => import('./pages/drop-details/DropDetailsPage'))
const ProductDetailsPage = lazy(() => import('./pages/product-details/ProductDetailsPage'))
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'))
const ActivityPage = lazy(() => import('./pages/activity/ActivityPage'))
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'))
const CartPage = lazy(() => import('./pages/cart/CartPage'))
const FriendsHubPage = lazy(() => import('./pages/friends/FriendsHubPage'))
const FriendPicksPage = lazy(() => import('./pages/friends/FriendPicksPage'))
const UserProfilePage = lazy(() => import('./pages/profile/UserProfilePage'))
const SellersDirectoryPage = lazy(() => import('./pages/sellers/SellersDirectoryPage'))
const SellerStorefrontPage = lazy(() => import('./pages/sellers/SellerStorefrontPage'))
const SellerApplyPage = lazy(() => import('./pages/sellers/SellerApplyPage'))
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage'))
const PublicShopPage = lazy(() => import('./pages/shop/PublicShopPage'))
const MyShopStudioPage = lazy(() => import('./pages/shop/MyShopStudioPage'))
const MyPicksPage = lazy(() => import('./pages/picks/MyPicksPage'))
const EarningsPage = lazy(() => import('./pages/earnings/EarningsPage'))
const LeaderboardPage = lazy(() => import('./pages/leaderboard/LeaderboardPage'))
const LanguagePage = lazy(() => import('./pages/settings/LanguagePage'))
const AuthScreen = lazy(() =>
  import('@/features/auth/components/AuthScreen').then((m) => ({ default: m.AuthScreen }))
)

export const consumerRoutes = (
  <>
    {/* Standard Consumer Experience with Top Header & Bottom Nav */}
    <Route element={<ConsumerLayout />}>
      <Route path="/" element={<ExplorePage />} />
      <Route path="/community" element={<HomePage />} />
      <Route path="/feed" element={<HomePage />} />
      <Route path="/explore" element={<ExplorePage />} />
      <Route path="/drops/:id" element={<DropDetailsPage />} />
      <Route path="/products/:id" element={<ProductDetailsPage />} />
      <Route path="/p/:id" element={<ProductDetailsPage />} />
      <Route path="/merchants" element={<SellersDirectoryPage />} />
      <Route path="/merchants/:slug" element={<SellerStorefrontPage />} />
      <Route path="/merchant/apply" element={<SellerApplyPage />} />
      <Route path="/friends" element={<FriendsHubPage />} />
      <Route path="/friend-picks" element={<FriendPicksPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/settings/language" element={<LanguagePage />} />
      <Route path="/profile/:username" element={<UserProfilePage />} />
      <Route path="/users/:username" element={<UserProfilePage />} />
      <Route path="/u/:username" element={<UserProfilePage />} />
      <Route path="/@:username" element={<UserProfilePage />} />
      <Route path="/activity" element={<ActivityPage />} />
      <Route path="/orders" element={<ActivityPage />} />
      <Route path="/orders/:orderId" element={<ActivityPage />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/shop/:slug" element={UI_FEATURES.personalStores ? <PublicShopPage /> : <Navigate to="/explore" replace />} />
      <Route path="/my-shop" element={UI_FEATURES.personalStores ? <MyShopStudioPage /> : <Navigate to="/my-picks" replace />} />
      <Route path="/my-picks" element={<MyPicksPage />} />
      <Route path="/earnings" element={<EarningsPage />} />
      <Route path="/leaderboards" element={<LeaderboardPage />} />
    </Route>



    {/* Focused Flows (Checkout, Auth, Login, Register) without Bottom Navigation */}
    <Route element={<FocusedLayout />}>
      <Route path="/checkout" element={<CheckoutPage />} />
      <Route path="/auth" element={<AuthScreen />} />
      <Route path="/login" element={<AuthScreen />} />
      <Route path="/register" element={<AuthScreen />} />
    </Route>
  </>
)
