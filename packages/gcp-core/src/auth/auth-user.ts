export interface AuthUser {
  id: string;
  email?: string;
  roles?: ReadonlyArray<string>;
}
