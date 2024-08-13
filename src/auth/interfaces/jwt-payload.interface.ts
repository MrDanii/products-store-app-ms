export interface JwtPayload {
  id: string
  email: string
  userNickName: string
  fullName: string
  roles: string[]
}