export default interface IUser {
  id: number;
  name: string;
  username: string;
  lastLogin: string;
  role: string;
  enabled: boolean;
  accessTokenGenerated: boolean;
}
