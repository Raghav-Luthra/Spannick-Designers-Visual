/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { OutfitLayer } from '../types';
import { Trash2Icon } from './icons';

interface OutfitStackProps {
  outfitHistory: OutfitLayer[];
  onRemoveLastGarment: () => void;
}

const OutfitStack: React.FC<OutfitStackProps> = ({ outfitHistory, onRemoveLastGarment }) => {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg sm:text-xl luxury-heading border-b border-yellow-600/30 pb-2 sm:pb-3 mb-3 sm:mb-4">Ensemble Stack</h2>
      <div className="space-y-2 sm:space-y-3">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between luxury-card-3d p-3 sm:p-4 rounded-lg animate-fade-in border border-yellow-600/20"
          >
            <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-4 text-xs font-bold text-black bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full luxury-glow">
                  {index + 1}
                </span>
                {layer.garment && (
                    <img src={layer.garment.url} alt={layer.garment.name} className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-cover rounded-lg mr-2 sm:mr-3 border border-yellow-600/30" />
                )}
                <span className="font-semibold text-gray-200 truncate tracking-wide text-sm sm:text-base" title={layer.garment?.name}>
                  {layer.garment ? layer.garment.name : 'Base Avatar'}
                </span>
            </div>
            {index > 0 && index === outfitHistory.length - 1 && (
               <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors p-2 sm:p-3 rounded-lg hover:bg-red-500/20"
                aria-label={`Remove ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-xs sm:text-sm text-gray-400 pt-4 sm:pt-6 italic px-2">Your curated pieces will appear here. Select an item from the atelier collection below.</p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;