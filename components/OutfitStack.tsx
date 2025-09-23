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
      <h2 className="text-xl luxury-heading border-b border-yellow-600/30 pb-3 mb-4">Ensemble Stack</h2>
      <div className="space-y-2">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between luxury-card-3d p-4 rounded-lg animate-luxury-fade-in border border-yellow-600/20"
          >
            <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-4 text-xs font-bold text-black bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full luxury-glow">
                  {index + 1}
                </span>
                {layer.garment && (
                    <img src={layer.garment.url} alt={layer.garment.name} className="flex-shrink-0 w-14 h-14 object-cover rounded-lg mr-4 border border-yellow-600/30" />
                )}
                <span className="font-semibold text-gray-200 truncate tracking-wide" title={layer.garment?.name}>
                  {layer.garment ? layer.garment.name : 'Base Avatar'}
                </span>
            </div>
            {index > 0 && index === outfitHistory.length - 1 && (
               <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-gray-400 hover:text-red-400 transition-colors p-3 rounded-lg hover:bg-red-500/20"
                aria-label={`Remove ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-sm text-gray-400 pt-6 italic">Your curated pieces will appear here. Select an item from the atelier collection below.</p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;