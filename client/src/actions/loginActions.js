export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export function loginAction(payload) {
  return {
    type: LOGIN,
    payload,
  };
}

export function logoutAction() {
  return {
    type: LOGOUT,
  };
}
