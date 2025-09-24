/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { RotateCcwIcon, ChevronLeftIcon, ChevronRightIcon } from './icons';
import Spinner from './Spinner';

interface CanvasProps {
  displayImageUrl: string | null;
  onStartOver: () => void;
  isLoading: boolean;
  loadingMessage: string;
  onSelectPose: (index: number) => void;
  poseInstructions: string[];
  currentPoseIndex: number;
  availablePoseKeys: string[];
}

const Canvas: React.FC<CanvasProps> = ({ displayImageUrl, onStartOver, isLoading, loadingMessage, onSelectPose, poseInstructions, currentPoseIndex, availablePoseKeys }) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  
  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
    // Fallback if current pose not in available list (shouldn't happen)
    if (currentIndexInAvailable === -1) {
        onSelectPose((currentPoseIndex - 1 + poseInstructions.length) % poseInstructions.length);
        return;
    }

    const prevIndexInAvailable = (currentIndexInAvailable - 1 + availablePoseKeys.length) % availablePoseKeys.length;
    const prevPoseInstruction = availablePoseKeys[prevIndexInAvailable];
    const newGlobalPoseIndex = poseInstructions.indexOf(prevPoseInstruction);
    
    if (newGlobalPoseIndex !== -1) {
        onSelectPose(newGlobalPoseIndex);
    }
  };

  const handleNextPose = () => {
    if (isLoading) return;

    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);

    // Fallback or if there are no generated poses yet
    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
        onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
        return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
        // There is another generated pose, navigate to it
        const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
        const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
        if (newGlobalPoseIndex !== -1) {
            onSelectPose(newGlobalPoseIndex);
        }
    } else {
        // At the end of generated poses, generate the next one from the master list
        const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
        onSelectPose(newGlobalPoseIndex);
    }
  };
  
  return (
    <div className="w-full h-full flex items-center justify-center p-2 sm:p-4 relative group perspective-luxury">
      {/* Start Over Button */}
      <button 
          onClick={onStartOver}
          className="absolute top-3 left-3 sm:top-6 sm:left-6 z-30 flex items-center justify-center text-center btn-secondary py-2 px-3 sm:py-3 sm:px-6 text-xs sm:text-sm font-semibold uppercase tracking-wider luxury-glow"
      >
          <RotateCcwIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">NEW SESSION</span>
          <span className="sm:hidden">NEW</span>
      </button>

      {/* Image Display or Placeholder */}
      <div className="relative w-full h-full flex items-center justify-center luxury-card-3d rounded-2xl overflow-hidden animate-luxury-float">
        {displayImageUrl ? (
          <img
            key={displayImageUrl} // Use key to force re-render and trigger animation on image change
            src={displayImageUrl}
            alt="Virtual try-on model"
            className="w-full h-full max-w-[200px] max-h-[300px] sm:max-w-[240px] sm:max-h-[360px] md:max-w-[280px] md:max-h-[420px] lg:max-w-[320px] lg:max-h-[480px] object-contain transition-opacity duration-300 animate-luxury-fade-in rounded-2xl mx-auto"
          />
        ) : (
            <div className="w-[200px] h-[300px] sm:w-[240px] sm:h-[360px] md:w-[280px] md:h-[420px] lg:w-[320px] lg:h-[480px] glass-panel border border-yellow-600/30 rounded-2xl flex flex-col items-center justify-center luxury-glow mx-auto">
              <Spinner />
              <p className="text-sm sm:text-base gold-accent mt-4 sm:mt-6 tracking-wider">Preparing Avatar...</p>
            </div>
        )}
        
          {isLoading && (
              <div className="absolute inset-0 glass-panel backdrop-blur-sm flex flex-col items-center justify-center z-20 rounded-2xl luxury-glow-intense">
                  <Spinner />
                  {loadingMessage && (
                      <p className="text-sm sm:text-base lg:text-lg gold-accent mt-4 sm:mt-6 text-center px-3 sm:px-4 tracking-wide">{loadingMessage}</p>
                  )}
              </div>
          )}
      </div>

      {/* Pose Controls */}
      {displayImageUrl && !isLoading && (
        <div 
          className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-luxury-slide-up"
          onMouseEnter={() => setIsPoseMenuOpen(true)}
          onMouseLeave={() => setIsPoseMenuOpen(false)}
        >
          {/* Pose popover menu */}
              {isPoseMenuOpen && (
                  <div className="absolute bottom-full mb-3 sm:mb-4 w-64 sm:w-72 glass-panel rounded-2xl p-3 sm:p-4 border border-yellow-600/30 animate-luxury-fade-in luxury-glow">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {poseInstructions.map((pose, index) => (
                              <button
                                  key={pose}
                                  onClick={() => onSelectPose(index)}
                                  disabled={isLoading || index === currentPoseIndex}
                                  className="w-full text-left text-xs sm:text-sm font-medium text-gray-200 p-2 sm:p-3 rounded-lg hover:bg-yellow-600/20 disabled:opacity-70 disabled:bg-yellow-600/30 disabled:font-bold disabled:cursor-not-allowed transition-all duration-200 tracking-wide"
                              >
                                  {pose}
                              </button>
                          ))}
                      </div>
                  </div>
              )}
          
          <div className="flex items-center justify-center gap-2 sm:gap-3 glass-panel rounded-2xl p-2 sm:p-3 border border-yellow-600/30 luxury-glow">
            <button 
              onClick={handlePreviousPose}
              aria-label="Previous pose"
              className="p-2 sm:p-3 rounded-lg hover:bg-yellow-600/20 transition-all disabled:opacity-50 btn-secondary"
              disabled={isLoading}
            >
              <ChevronLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" />
            </button>
            <span className="text-xs sm:text-sm font-semibold text-gray-200 w-32 sm:w-52 text-center truncate tracking-wide" title={poseInstructions[currentPoseIndex]}>
              {poseInstructions[currentPoseIndex]}
            </span>
            <button 
              onClick={handleNextPose}
              aria-label="Next pose"
              className="p-2 sm:p-3 rounded-lg hover:bg-yellow-600/20 transition-all disabled:opacity-50 btn-secondary"
              disabled={isLoading}
            >
              <ChevronRightIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;