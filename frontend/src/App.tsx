import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage.tsx";
import AuthCallBackPage from "./pages/auth-callback/AuthCallBackPage.tsx";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout.tsx";
import ChatPage from "./pages/chat/ChatPage.tsx";
import AlbumPage from "./pages/album/AlbumPage.tsx";
import AdminPage from "./pages/admin/AdminPage.tsx";
import { Toaster } from "react-hot-toast";
import { UploadFilesPage } from "./pages/admin/upload/UploadFilesPage.tsx";
import NotFoundPage from "./pages/404/NotFoundPage.tsx";

function App() {
  return (
    <>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/album/:albumId" element={<AlbumPage />} />
        </Route>

        <Route
          path="/sso-callback"
          element={
            <AuthenticateWithRedirectCallback
              signUpForceRedirectUrl={"/auth-callback"}
            />
          }
        />
        <Route path="/auth-callback" element={<AuthCallBackPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/admin/uploadFiles" element={<UploadFilesPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
