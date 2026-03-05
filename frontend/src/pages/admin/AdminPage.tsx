import { useAuthStore } from "@/stores/useAuthStore";
import DashboardStats from "./components/DashboardStats";
import Header from "./components/Header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Album, Music } from "lucide-react";
import AlbumsTabContent from "./components/AlbumsTabContent";
import SongsTabContent from "./components/SongsTabContent";
import { useEffect } from "react";
import { useMusicStore } from "@/stores/useMusicStore";

const AdminPage = () => {
  const { isAdmin, isLoading } = useAuthStore();
  if (!isAdmin && !isLoading) {
    return <div>Unauthorized</div>;
  }
  const { fetchStats, fetchSongs, fetchAlbums } = useMusicStore();
  useEffect(() => {
    fetchStats();
    fetchSongs();
    fetchAlbums();
  }, [fetchStats, fetchSongs, fetchAlbums]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 via-zinc-900 to-black text-zinc-100 p-8 ">
      <Header />
      <DashboardStats />
      <Tabs defaultValue="songs" className="space-y-6">
        <TabsList className="bg-zinc-800/50 p-1">
          <TabsTrigger
            value="songs"
            className="data-[state=active]:bg-zinc-700"
          >
            <Music className="size-4 mr-2" />
            Songs
          </TabsTrigger>
          <TabsTrigger
            value="albums"
            className="data-[state=active]:bg-zinc-700"
          >
            <Album className="size-4 mr-2" />
            Albums
          </TabsTrigger>
        </TabsList>
        <TabsContent value="songs">
          <SongsTabContent />
        </TabsContent>
        <TabsContent value="albums">
          <AlbumsTabContent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPage;
