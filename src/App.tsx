import React from 'react';
import Layout from './components/Layout';
import SmartPreview from './components/SmartPreview';
import Timeline from './components/Timeline/Timeline';
import { ProjectProvider } from './ProjectStore';
import MediaManager from './components/MediaManager/MediaManager';
import PromptOverlay from './components/PromptOverlay';
import './index.css';

import Header from './components/Header';

import ExportModal from './components/ExportModal';

const AppContent: React.FC = () => {
  const [isExportModalOpen, setIsExportModalOpen] = React.useState(false);

  return (
    <Layout
      header={<Header onExport={() => setIsExportModalOpen(true)} />}
    >
      <div className="editing-area" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Top Header / Nav Removed from here */}

        {/* Video Preview & Timeline Center */}
        <div style={{ flex: 1, display: 'flex', gap: '16px', minHeight: 0 }}>
          <SmartPreview />

          <div className="assets-panel-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <MediaManager />
          </div>
        </div>

        {/* Timeline */}
        <div style={{ minHeight: '320px', flexShrink: 0 }}>
          <Timeline />
        </div>

        <PromptOverlay />
        <ExportModal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} />
      </div>
    </Layout>
  );
};

const App: React.FC = () => {
  return (
    <ProjectProvider>
      <AppContent />
    </ProjectProvider>
  );
};

export default App;
