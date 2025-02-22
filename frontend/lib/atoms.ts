import { atom } from 'recoil';

export const authState = atom({
  key: 'authState', // unique ID (with respect to other atoms/selectors)
  default: { isAuthenticated: false, user: null }, // default value (initial value)
}); 