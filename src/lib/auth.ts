export const AUTH_USER = "roxane.rvre";
export const AUTH_PASSWORD = "yayaroro974934";
export const AUTH_COOKIE = "roro_session";
export const AUTH_COOKIE_VALUE = "saint-gilles-ok";

export function isValidLogin(username: FormDataEntryValue | null, password: FormDataEntryValue | null) {
  return username === AUTH_USER && password === AUTH_PASSWORD;
}
