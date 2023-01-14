import { LOGIN, LOGOUT } from '../actions/loginActions.js';

const initialState = {
  userId: null,
};

export default function loginReducer(state = initialState, action) {
  switch (action.type) {
    case LOGIN:
      return {
        ...state,
        userId: action.payload,
      };
    case LOGOUT:
      return {
        ...state,
        userId: null,
      };
    default:
      return state;
  }
}