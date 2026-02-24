export const getPublicUser = () =>
  JSON.parse(localStorage.getItem("publicUser"));

export const setPublicUser = (user) =>
  localStorage.setItem("publicUser", JSON.stringify(user));

export const clearPublicUser = () =>
  localStorage.removeItem("publicUser");