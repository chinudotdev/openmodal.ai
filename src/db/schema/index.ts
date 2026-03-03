import { account, session, user, verification } from './auth'

export * from './admin'
export * from './auth'
export * from './capabilities'
export * from './discussions'
export * from './draft-changes'
export * from './feedback'
export * from './jobs'
export * from './notifications'
export * from './organizations'
export * from './reports'
export * from './suggestions'
export * from './technologies'
export * from './user-profile'

export const authSchema = {
  user,
  account,
  session,
  verification,
}
