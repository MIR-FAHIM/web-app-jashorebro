import { apiClient } from '@/shared/api/apiClient'
import { createFriendPicksService } from './friendPicksService'

export const friendPicksApi = createFriendPicksService(apiClient)
