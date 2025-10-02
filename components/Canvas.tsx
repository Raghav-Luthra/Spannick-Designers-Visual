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

const Canvas: React.FC<CanvasProps> = ({ 
  displayImageUrl, 
  onStartOver, 
  isLoading, 
  loadingMessage, 
  onSelectPose, 
  poseInstructions, 
  currentPoseIndex, 
  availablePoseKeys 
}) => {
  const [isPoseMenuOpen, setIsPoseMenuOpen] = useState(false);
  
  const handlePreviousPose = () => {
    if (isLoading || availablePoseKeys.length <= 1) return;
    const currentPoseInstruction = poseInstructions[currentPoseIndex];
    const currentIndexInAvailable = availablePoseKeys.indexOf(currentPoseInstruction);
    
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

    if (currentIndexInAvailable === -1 || availablePoseKeys.length === 0) {
        onSelectPose((currentPoseIndex + 1) % poseInstructions.length);
        return;
    }
    
    const nextIndexInAvailable = currentIndexInAvailable + 1;
    if (nextIndexInAvailable < availablePoseKeys.length) {
        const nextPoseInstruction = availablePoseKeys[nextIndexInAvailable];
        const newGlobalPoseIndex = poseInstructions.indexOf(nextPoseInstruction);
        if (newGlobalPoseIndex !== -1) {
            onSelectPose(newGlobalPoseIndex);
        }
    } else {
        const newGlobalPoseIndex = (currentPoseIndex + 1) % poseInstructions.length;
        onSelectPose(newGlobalPoseIndex);
    }
  };
  
  return (
    <div className="w-full h-full flex-center relative group p-8">
      {/* Start Over Button */}
      <button 
        onClick={onStartOver}
        className="absolute top-6 left-6 z-30 btn-ghost flex items-center gap-2"
      >
        <RotateCcwIcon className="w-4 h-4" />
        <span className="hidden sm:inline">NEW SESSION</span>
        <span className="sm:hidden">NEW</span>
      </button>

      {/* Main Image Display */}
      <div className="relative">
        {displayImageUrl ? (
          <div className="image-container">
            <img
              key={displayImageUrl}
              src={displayImageUrl}
              alt="Virtual try-on model"
              className="w-80 h-[480px] object-contain fade-in"
            />
          </div>
        ) : (
          <div className="w-80 h-[480px] glass-card flex-center flex-col">
            <Spinner />
            <p className="accent-text mt-4 font-medium">Preparing Avatar...</p>
          </div>
        )}
        
        {isLoading && (
          <div className="absolute inset-0 glass-card flex-center flex-col">
            <Spinner />
            {loadingMessage && (
              <p className="accent-text mt-4 text-center font-medium">{loadingMessage}</p>
            )}
          </div>
        )}
      </div>

      {/* Pose Controls */}
      {displayImageUrl && !isLoading && (
        <div 
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300"
          onMouseEnter={() => setIsPoseMenuOpen(true)}
          onMouseLeave={() => setIsPoseMenuOpen(false)}
        >
          {/* Pose Menu */}
          {isPoseMenuOpen && (
            <div className="absolute bottom-full mb-4 w-72 glass-card p-4 fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {poseInstructions.map((pose, index) => (
                  <button
                    key={pose}
                    onClick={() => onSelectPose(index)}
                    disabled={isLoading || index === currentPoseIndex}
                    className={`text-left text-sm p-3 rounded-lg transition-all ${
                      index === currentPoseIndex 
                        ? 'bg-accent-text bg-opacity-20 font-semibold cursor-not-allowed' 
                        : 'hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    {pose}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Pose Navigation */}
          <div className="glass-card p-3 flex items-center gap-3">
            <button 
              onClick={handlePreviousPose}
              disabled={isLoading}
              className="btn-ghost p-2"
              aria-label="Previous pose"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <span className="text-sm font-medium w-48 text-center truncate" title={poseInstructions[currentPoseIndex]}>
              {poseInstructions[currentPoseIndex]}
            </span>
            
            <button 
              onClick={handleNextPose}
              disabled={isLoading}
              className="btn-ghost p-2"
              aria-label="Next pose"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Canvas;