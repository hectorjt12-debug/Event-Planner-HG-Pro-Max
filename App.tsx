import React from 'react';
import Navigation from './components/Navigation';
import Dashboard from './views/Dashboard';
import LiveVoice from './views/LiveVoice';
import ImageStudio from './views/ImageStudio';
import VeoCinema from './views/VeoCinema';
import AtlasMaps from './views/AtlasMaps';
import MapEditor from './views/EventPlanner/MapEditor';
import NexusBackground from './components/NexusBackground';

import { View } from './types';
import { useViewState } from './store';
import { SafeScreen } from './components/SafeScreen';
import InstallPwa from './components/InstallPwa';

const App: React.FC = () => {
  const currentView = useViewState((s) => s.currentView);

  const map: Record<View, React.ReactNode> = {
    [View.DASHBOARD]: <Dashboard />,
    [View.LIVE_VOICE]: <LiveVoice />,
    [View.IMAGE_STUDIO]: <ImageStudio />,
    [View.CINEMA_VEO]: <VeoCinema />,
    [View.ATLAS_MAPS]: <AtlasMaps />,
    [View.EVENT_PLANNER]: <MapEditor />
  };

  return (
    <SafeScreen>
      <div className="flex h-screen bg-[#0a0a0a] text-white overflow-hidden relative">
        <Navigation />
        
        <main className="flex-1 relative overflow-hidden">
           <NexusBackground />
           {map[currentView] || <Dashboard />}
        </main>

        <InstallPwa />
      </div>
    </SafeScreen>
  );
};

export default App;