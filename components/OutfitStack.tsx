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
      <h2 className="text-xl brand-heading text-gray-800 border-b border-gray-300 pb-3 mb-4">Ensemble Stack</h2>
      <div className="space-y-2">
        {outfitHistory.map((layer, index) => (
          <div
            key={layer.garment?.id || 'base'}
            className="flex items-center justify-between card p-4 rounded-lg fade-in border border-gray-200"
          >
            <div className="flex items-center overflow-hidden">
                <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 mr-4 text-xs font-bold text-white bg-yellow-600 rounded-full">
                  {index + 1}
                </span>
                {layer.garment && (
                    <img src={layer.garment.url} alt={layer.garment.name} className="flex-shrink-0 w-14 h-14 object-cover rounded-lg mr-4 border border-gray-300" />
                )}
                <span className="font-semibold text-gray-800 truncate tracking-wide" title={layer.garment?.name}>
                  {layer.garment ? layer.garment.name : 'Base Avatar'}
                </span>
            </div>
            {index > 0 && index === outfitHistory.length - 1 && (
               <button
                onClick={onRemoveLastGarment}
                className="flex-shrink-0 text-gray-500 hover:text-red-600 transition-colors p-3 rounded-lg hover:bg-red-50"
                aria-label={`Remove ${layer.garment?.name}`}
              >
                <Trash2Icon className="w-5 h-5" />
              </button>
            )}
          </div>
        ))}
        {outfitHistory.length === 1 && (
            <p className="text-center text-sm text-gray-500 pt-6 italic">Your curated pieces will appear here. Select an item from the atelier collection below.</p>
        )}
      </div>
    </div>
  );
};

export default OutfitStack;