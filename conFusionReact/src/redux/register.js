import * as ActionTypes from "./ActionTypes";
export const Register = (
  state = {
    isLoading: false,
    isSignedUp: false,
    errmess: null,
  },
  action
) => {
  switch (action.type) {
    case ActionTypes.SIGNUP_REQUEST:
      return {
        ...state,
        isLoading: true,
        isSignedUp: false,
      };
    case ActionTypes.SIGNUP_SUCCESS:
      return {
        ...state,
        isLoading: false,
        isSignedUp: true,
        errmess: "",
      };
    case ActionTypes.SIGNUP_FAILURE:
      return {
        ...state,
        isLoading: false,
        isSignedUp: false,
        errMess: action.message,
      };
    default:
      return state;
  }
};
