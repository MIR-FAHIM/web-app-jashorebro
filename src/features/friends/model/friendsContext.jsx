import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { friendsApi } from '../api/friendsApi'
import { useAuth } from '@/features/auth/model/authContext'

const FriendsContext = createContext(null)

export function FriendsProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [incomingCount, setIncomingCount] = useState(0)
  const [incomingRequests, setIncomingRequests] = useState([])
  const [outgoingRequests, setOutgoingRequests] = useState([])
  const [friends, setFriends] = useState([])
  const [isLoadingRequests, setIsLoadingRequests] = useState(false)
  const [isLoadingFriends, setIsLoadingFriends] = useState(false)

  // Refresh pending requests and badge count
  const refreshRequests = useCallback(async () => {
    if (!isAuthenticated) {
      setIncomingCount(0)
      setIncomingRequests([])
      setOutgoingRequests([])
      return
    }

    try {
      setIsLoadingRequests(true)
      const data = await friendsApi.getRequests()
      setIncomingRequests(data.incoming || [])
      setOutgoingRequests(data.outgoing || [])
      setIncomingCount(data.incoming_count || 0)
    } catch {
      // Quiet fail if network error
    } finally {
      setIsLoadingRequests(false)
    }
  }, [isAuthenticated])

  // Refresh friends list
  const refreshFriends = useCallback(async (query = '') => {
    if (!isAuthenticated) {
      setFriends([])
      return
    }

    try {
      setIsLoadingFriends(true)
      const res = await friendsApi.getFriends({ query })
      setFriends(res.data || [])
    } catch {
      // Quiet fail
    } finally {
      setIsLoadingFriends(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated) {
      refreshRequests()
      refreshFriends()
    } else {
      setIncomingCount(0)
      setIncomingRequests([])
      setOutgoingRequests([])
      setFriends([])
    }
  }, [isAuthenticated, refreshRequests, refreshFriends])

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
        friends,
        incomingRequests,
        outgoingRequests,
        incomingCount,
        isLoadingFriends,
        isLoadingRequests,
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
