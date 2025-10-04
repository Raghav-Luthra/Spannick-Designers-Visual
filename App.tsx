/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import Canvas from './components/Canvas';
import WardrobePanel from './components/WardrobeModal';
import OutfitStack from './components/OutfitStack';
import Header from './components/Header';
import Footer from './components/Footer';
import { generateVirtualTryOnImage, generatePoseVariation } from './services/geminiService';
import { OutfitLayer, WardrobeItem } from './types';
import { ChevronDownIcon, ChevronUpIcon } from './components/icons';
import { defaultWardrobe } from './wardrobe';
import { getFriendlyErrorMessage } from '@/lib/utils';
import Spinner from './components/Spinner';

const POSE_INSTRUCTIONS = [
  "Full frontal view, hands on hips",
  "Slightly turned, 3/4 view",
  "Side profile view",
  "Jumping in the air, mid-action shot",
  "Walking towards camera",
  "Leaning against a wall",
];

const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);

    mediaQueryList.addEventListener('change', listener);
    
    if (mediaQueryList.matches !== matches) {
      setMatches(mediaQueryList.matches);
    }

    return () => {
      mediaQueryList.removeEventListener('change', listener);
    };
  }, [query, matches]);

  return matches;
};

const App: React.FC = () => {
  const [modelImageUrl, setModelImageUrl] = useState<string | null>(null);
  const [outfitHistory, setOutfitHistory] = useState<OutfitLayer[]>([]);
  const [currentOutfitIndex, setCurrentOutfitIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [currentPoseIndex, setCurrentPoseIndex] = useState(0);
  const isMobile = useMediaQuery('(max-width: 767px)');
  const [isSheetCollapsed, setIsSheetCollapsed] = useState(false);
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(defaultWardrobe);

  const activeOutfitLayers = useMemo(() => 
    outfitHistory.slice(0, currentOutfitIndex + 1), 
    [outfitHistory, currentOutfitIndex]
  );
  
  const activeGarmentIds = useMemo(() => 
    activeOutfitLayers.map(layer => layer.garment?.id).filter(Boolean) as string[], 
    [activeOutfitLayers]
  );
  
  const displayImageUrl = useMemo(() => {
    if (outfitHistory.length === 0) return modelImageUrl;
    const currentLayer = outfitHistory[currentOutfitIndex];
    if (!currentLayer) return modelImageUrl;

    const poseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
    return currentLayer.poseImages[poseInstruction] ?? Object.values(currentLayer.poseImages)[0];
  }, [outfitHistory, currentOutfitIndex, currentPoseIndex, modelImageUrl]);

  const availablePoseKeys = useMemo(() => {
    if (outfitHistory.length === 0) return [];
    const currentLayer = outfitHistory[currentOutfitIndex];
    return currentLayer ? Object.keys(currentLayer.poseImages) : [];
  }, [outfitHistory, currentOutfitIndex]);

  const handleModelFinalized = (url: string) => {
    setModelImageUrl(url);
    setOutfitHistory([{
      garment: null,
      poseImages: { [POSE_INSTRUCTIONS[0]]: url }
    }]);
    setCurrentOutfitIndex(0);
    setIsSheetCollapsed(isMobile);
  };

  const handleStartOver = () => {
    setModelImageUrl(null);
    setOutfitHistory([]);
    setCurrentOutfitIndex(0);
    setIsLoading(false);
    setLoadingMessage('');
    setError(null);
    setCurrentPoseIndex(0);
    setIsSheetCollapsed(false);
    setWardrobe(defaultWardrobe);
  };

  const handleGarmentSelect = useCallback(async (garmentFile: File, garmentInfo: WardrobeItem) => {
    if (!displayImageUrl || isLoading) return;

    const nextLayer = outfitHistory[currentOutfitIndex + 1];
    if (nextLayer && nextLayer.garment?.id === garmentInfo.id) {
        setCurrentOutfitIndex(prev => prev + 1);
        setCurrentPoseIndex(0);
        return;
    }

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Adding ${garmentInfo.name}...`);

    try {
      const newImageUrl = await generateVirtualTryOnImage(displayImageUrl, garmentFile);
      const currentPoseInstruction = POSE_INSTRUCTIONS[currentPoseIndex];
      
      const newLayer: OutfitLayer = { 
        garment: garmentInfo, 
        poseImages: { [currentPoseInstruction]: newImageUrl } 
      };

      setOutfitHistory(prevHistory => {
        const newHistory = prevHistory.slice(0, currentOutfitIndex + 1);
        return [...newHistory, newLayer];
      });
      setCurrentOutfitIndex(prev => prev + 1);
      
      setWardrobe(prev => {
        if (prev.find(item => item.id === garmentInfo.id)) {
            return prev;
        }
        return [...prev, garmentInfo];
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to apply garment'));
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [displayImageUrl, isLoading, currentPoseIndex, outfitHistory, currentOutfitIndex]);

  const handleRemoveLastGarment = () => {
    if (currentOutfitIndex > 0) {
      setCurrentOutfitIndex(prevIndex => prevIndex - 1);
      setCurrentPoseIndex(0);
    }
  };
  
  const handlePoseSelect = useCallback(async (newIndex: number) => {
    if (isLoading || outfitHistory.length === 0 || newIndex === currentPoseIndex) return;
    
    const poseInstruction = POSE_INSTRUCTIONS[newIndex];
    const currentLayer = outfitHistory[currentOutfitIndex];

    if (currentLayer.poseImages[poseInstruction]) {
      setCurrentPoseIndex(newIndex);
      return;
    }

    const baseImageForPoseChange = Object.values(currentLayer.poseImages)[0];
    if (!baseImageForPoseChange) return;

    setError(null);
    setIsLoading(true);
    setLoadingMessage(`Changing pose...`);
    
    const prevPoseIndex = currentPoseIndex;
    setCurrentPoseIndex(newIndex);

    try {
      const newImageUrl = await generatePoseVariation(baseImageForPoseChange, poseInstruction);
      setOutfitHistory(prevHistory => {
        const newHistory = [...prevHistory];
        const updatedLayer = newHistory[currentOutfitIndex];
        updatedLayer.poseImages[poseInstruction] = newImageUrl;
        return newHistory;
      });
    } catch (err) {
      setError(getFriendlyErrorMessage(err, 'Failed to change pose'));
      setCurrentPoseIndex(prevPoseIndex);
    } finally {
      setIsLoading(false);
      setLoadingMessage('');
    }
  }, [currentPoseIndex, outfitHistory, isLoading, currentOutfitIndex]);

  return (
    <div className="min-h-screen">
      {!modelImageUrl ? (
        <>
          <Header />
          <main className="pt-20">
            <StartScreen onModelFinalized={handleModelFinalized} />
          </main>
        </>
      ) : (
        <div className="flex flex-col h-screen">
          <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Canvas Area */}
            <div className="flex-1 relative pb-16 md:pb-0">
              <Canvas
                displayImageUrl={displayImageUrl}
                onStartOver={handleStartOver}
                isLoading={isLoading}
                loadingMessage={loadingMessage}
                onSelectPose={handlePoseSelect}
                poseInstructions={POSE_INSTRUCTIONS}
                currentPoseIndex={currentPoseIndex}
                availablePoseKeys={availablePoseKeys}
              />
            </div>

            {/* Sidebar */}
            <aside
              className={`absolute md:relative bottom-0 right-0 w-full md:w-80 glass-card border-t md:border-t-0 md:border-l border-opacity-20 transition-all duration-300 z-10 ${
                isSheetCollapsed ? 'h-14' : 'h-[70vh]'
              } md:h-auto md:translate-y-0`}
            >
              {/* Mobile Toggle */}
              <button
                onClick={() => setIsSheetCollapsed(!isSheetCollapsed)}
                className="md:hidden w-full h-14 flex-center glass-card border-b border-opacity-20"
                aria-label={isSheetCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                <div className="flex items-center gap-2">
                  {isSheetCollapsed ? (
                    <>
                      <ChevronUpIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">View Collection</span>
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Hide Collection</span>
                    </>
                  )}
                </div>
              </button>

              {/* Sidebar Content */}
              <div className={`p-4 md:p-6 pb-6 md:pb-20 overflow-y-auto space-y-6 md:space-y-8 ${
                isSheetCollapsed ? 'hidden' : 'h-[calc(70vh-3.5rem)]'
              } md:block md:h-full`}>
                {error && (
                  <div className="glass-card p-4 border-red-500 border" role="alert">
                    <p className="font-semibold text-red-400 mb-1">Error</p>
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}

                <OutfitStack
                  outfitHistory={activeOutfitLayers}
                  onRemoveLastGarment={handleRemoveLastGarment}
                />

                <WardrobePanel
                  onGarmentSelect={handleGarmentSelect}
                  activeGarmentIds={activeGarmentIds}
                  isLoading={isLoading}
                  wardrobe={wardrobe}
                />
              </div>
            </aside>
          </main>

          {/* Mobile Loading Overlay */}
          {isLoading && isMobile && (
            <div className="fixed inset-0 glass-card flex-center flex-col z-50">
              <Spinner />
              {loadingMessage && (
                <p className="accent-text mt-4 text-center font-medium">{loadingMessage}</p>
              )}
            </div>
          )}
        </div>
      )}
      
      <Footer isOnDressingScreen={!!modelImageUrl} />
    </div>
  );
};

export default App;