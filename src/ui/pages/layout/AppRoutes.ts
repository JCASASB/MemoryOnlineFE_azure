export const AppRoutes = {
  home: "/",
  login: "/login",
  profile: "/profile",
  gameLobby: "/lobby",
  gameBoard: "/gameboard",
  gameBoard3D: "/gameboard3d",
  chat: "/chat",
  uploadPhotos: "/photos",
  join: "/join",
} as const;

export type AppRoutePath = (typeof AppRoutes)[keyof typeof AppRoutes];
