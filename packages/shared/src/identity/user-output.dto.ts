/** User data returned to clients. Never includes the password. */
export interface IUserOutput {
  id: string;
  nomeCompleto: string;
  /** ISO 8601 date (`YYYY-MM-DD`). */
  dataNascimento: string;
  email?: string;
  celular?: string;
}
