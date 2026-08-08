import "./App.css";
import { DependencyProvider } from "./ui/context/DependencyContext";
import { GameBoard } from "./ui/pages/innerPages/gameBoard/GameBoard";
import { Home } from "./ui/pages/innerPages/home/Home";
import { Login } from "./ui/pages/innerPages/login/Login";
import { UploadPhotos } from "./ui/pages/innerPages/UploadPhotos";
import { Chat } from "./ui/pages/innerPages/chat/Chat";
import { PrivateRoute } from "./ui/components/PrivateRoute";
import { HashRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./ui/pages/layout/Layout";
import { AppRoutes } from "./ui/pages/layout/AppRoutes";
import { GameLobby } from "./ui/pages/innerPages/gameLobby/GameLobby";
import { Profile } from "./ui/pages/innerPages/profile/Profile";

function App() {
  return (
    <HashRouter>
      <DependencyProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path={AppRoutes.login} element={<Login />} />
            <Route element={<PrivateRoute />}>
              <Route path={AppRoutes.home} element={<Home />} />
              <Route path={AppRoutes.gameLobby} element={<GameLobby />} />
              <Route path={AppRoutes.uploadPhotos} element={<UploadPhotos />} />
              <Route path={AppRoutes.chat} element={<Chat />} />
              <Route path={AppRoutes.gameBoard} element={<GameBoard />} />
              <Route path={AppRoutes.profile} element={<Profile />} />
            </Route>
          </Route>
        </Routes>
      </DependencyProvider>
    </HashRouter>
  );
}

export default App;
