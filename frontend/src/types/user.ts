export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  api_key: string | null;
  is_active: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}
