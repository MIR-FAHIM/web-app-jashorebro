import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { friendsApi } from '../api/friendsApi'
import { useAuth } from '@/features/auth/model/authContext'

const FriendsContext = createContext(null)

export function FriendsProvider({ children }) {
  const { user, isAuthenticated, isLoading: isLoadingAuth } = useAuth()
  const accountKey = !isLoadingAuth && isAuthenticated ? String(user.id ?? user.username ?? 'authenticated') : null
  const activeAccount = useRef(accountKey)
  const friendsRequest = useRef(0)
  const requestsRequest = useRef(0)
  const [friendsState, setFriendsState] = useState({ accountKey: null, items: [], isLoading: false, hasLoaded: false, error: '' })
  const [requestsState, setRequestsState] = useState({ accountKey: null, incoming: [], outgoing: [], count: 0, isLoading: false, hasLoaded: false, error: '' })

  // Invalidate in-flight responses on sign-out, account changes, and unmount.
  useEffect(() => {
    activeAccount.current = accountKey
    return () => {
      activeAccount.current = null
      friendsRequest.current += 1
      requestsRequest.current += 1
    }
  }, [accountKey])

  // Refresh pending requests and badge count
  const refreshRequests = useCallback(async () => {
    if (!accountKey || activeAccount.current !== accountKey) return

    const requestId = ++requestsRequest.current
    setRequestsState((previous) => ({
      ...(previous.accountKey === accountKey ? previous : { accountKey, incoming: [], outgoing: [], count: 0, hasLoaded: false }),
      isLoading: true,
      error: '',
    }))
    try {
      const data = await friendsApi.getRequests()
      if (requestsRequest.current !== requestId || activeAccount.current !== accountKey) return
      setRequestsState({ accountKey, incoming: data.incoming || [], outgoing: data.outgoing || [], count: data.incoming_count || 0, isLoading: false, hasLoaded: true, error: '' })
    } catch {
      if (requestsRequest.current !== requestId || activeAccount.current !== accountKey) return
      setRequestsState((previous) => ({ ...previous, isLoading: false, error: 'We couldn’t load your friend requests. Please try again.' }))
    }
  }, [accountKey])

  // Refresh friends list
  const refreshFriends = useCallback(async (query = '') => {
    if (!accountKey || activeAccount.current !== accountKey) return

    const requestId = ++friendsRequest.current
    setFriendsState((previous) => ({
      ...(previous.accountKey === accountKey ? previous : { accountKey, items: [], hasLoaded: false }),
      isLoading: true,
      error: '',
    }))
    try {
      const res = await friendsApi.getFriends({ query })
      if (friendsRequest.current !== requestId || activeAccount.current !== accountKey) return
      setFriendsState({ accountKey, items: res.data || [], isLoading: false, hasLoaded: true, error: '' })
    } catch {
      if (friendsRequest.current !== requestId || activeAccount.current !== accountKey) return
      setFriendsState((previous) => ({ ...previous, isLoading: false, error: 'We couldn’t load your friends. Please try again.' }))
    }
  }, [accountKey])

  useEffect(() => {
    if (accountKey) {
      refreshRequests()
      refreshFriends()
    } else {
      setFriendsState({ accountKey: null, items: [], isLoading: false, hasLoaded: false, error: '' })
      setRequestsState({ accountKey: null, incoming: [], outgoing: [], count: 0, isLoading: false, hasLoaded: false, error: '' })
    }
  }, [accountKey, refreshRequests, refreshFriends])

  const ownsFriends = accountKey !== null && friendsState.accountKey === accountKey
  const ownsRequests = accountKey !== null && requestsState.accountKey === accountKey

  // Send friend request
  const sendRequest = async ({ recipient_id, username }) => {
    const res = await friendsApi.sendRequest({ recipient_id, username })
    await refreshRequests()
    return res
  }

  // Accept incoming request
  const acceptRequest = async (friendshipId) => {
    const res = await friendsApi.acceptRequest(friendshipId)
    await Promise.all([refreshRequests(), refreshFriends()])
    return res
  }

  // Decline incoming request
  const declineRequest = async (friendshipId) => {
    const res = await friendsApi.declineRequest(friendshipId)
    await refreshRequests()
    return res
  }

  // Cancel outgoing request
  const cancelRequest = async (friendshipId) => {
    const res = await friendsApi.cancelRequest(friendshipId)
    await refreshRequests()
    return res
  }

  // Remove a friend
  const unfriend = async (userId) => {
    const res = await friendsApi.unfriend(userId)
    await refreshFriends()
    return res
  }

  return (
    <FriendsContext.Provider
      value={{
        friends: ownsFriends ? friendsState.items : [],
        incomingRequests: ownsRequests ? requestsState.incoming : [],
        outgoingRequests: ownsRequests ? requestsState.outgoing : [],
        incomingCount: ownsRequests ? requestsState.count : 0,
        isLoadingFriends: ownsFriends && friendsState.isLoading,
        isLoadingRequests: ownsRequests && requestsState.isLoading,
        hasLoadedFriends: ownsFriends && friendsState.hasLoaded,
        hasLoadedRequests: ownsRequests && requestsState.hasLoaded,
        friendsError: ownsFriends ? friendsState.error : '',
        requestsError: ownsRequests ? requestsState.error : '',
        refreshRequests,
        refreshFriends,
        sendRequest,
        acceptRequest,
        declineRequest,
        cancelRequest,
        unfriend,
      }}
    >
      {children}
    </FriendsContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFriends() {
  const context = useContext(FriendsContext)
  if (!context) {
    throw new Error('useFriends must be used within a FriendsProvider')
  }
  return context
}
