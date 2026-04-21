import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Tour from "@/pages/Tour";
import Merch from "@/pages/Merch";
import ArtistBassgawd from "@/pages/ArtistBassgawd";
import ArtistReed from "@/pages/ArtistReed";
import ArtistHallways from "@/pages/ArtistHallways";
import Tutorials from "@/pages/Tutorials";
import Blog from "@/pages/Blog";
import ArticleView from "@/pages/ArticleView";
import SamplePacks from "@/pages/SamplePacks";
import Admin from "@/pages/Admin";
import Software from "@/pages/Software";
import HolyTabletPage from "@/pages/HolyTabletPage";
import { MusicPlayer } from "@/components/ui/MusicPlayer";

function Router() {
  return (
    <div className="relative pb-24">
      <Switch>
        <Route path="/" component={Home}/>
        <Route path="/tour" component={Tour}/>
        <Route path="/merch" component={Merch}/>
        <Route path="/bassgawd" component={ArtistBassgawd}/>
        <Route path="/reed" component={ArtistReed}/>
        <Route path="/hallways" component={ArtistHallways}/>
        <Route path="/tutorials" component={Tutorials}/>
        <Route path="/blog" component={Blog}/>
        <Route path="/article/:id" component={ArticleView}/>
        <Route path="/sample-packs" component={SamplePacks}/>
        <Route path="/software" component={Software}/>
        <Route path="/holytablet" component={HolyTabletPage}/>
        <Route path="/admin" component={Admin}/>
        <Route component={NotFound} />
      </Switch>
      <MusicPlayer />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
