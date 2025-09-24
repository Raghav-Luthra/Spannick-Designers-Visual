/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { UploadCloudIcon } from './icons';
import { Compare } from './ui/compare';
import { generateModelImage } from '../services/geminiService';
import Spinner from './Spinner';
import { getFriendlyErrorMessage } from '@/lib/utils';

interface StartScreenProps {
  onModelFinalized: (modelUrl: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onModelFinalized }) => {
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
        setError('Please select an image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
        const dataUrl = e.target?.result as string;
        setUserImageUrl(dataUrl);
        setIsGenerating(true);
        setGeneratedModelUrl(null);
        setError(null);
        try {
            const result = await generateModelImage(file);
            setGeneratedModelUrl(result);
        } catch (err) {
            setError(getFriendlyErrorMessage(err, 'Failed to create model'));
            setUserImageUrl(null);
        } finally {
            setIsGenerating(false);
        }
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const reset = () => {
    setUserImageUrl(null);
    setGeneratedModelUrl(null);
    setIsGenerating(false);
    setError(null);
  };


  return (
    <>
      {!userImageUrl ? (
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-16 animate-luxury-fade-in px-4">
          <div className="lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left luxury-card-3d p-6 lg:p-12">
            <div className="max-w-2xl w-full">
              <div className="flex items-center justify-center lg:justify-start mb-4">
                <div className="w-3 h-3 bg-yellow-600 rounded-full mr-3"></div>
                <span className="gold-accent font-semibold tracking-wider uppercase text-xs sm:text-sm">Bespoke Fashion Experience</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl luxury-heading leading-tight mb-6 lg:mb-8">
                SPANNICK
                <br />
                <span className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-light tracking-widest gold-accent">DESIGNERS</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6 lg:mb-10 font-light">
                Where tradition meets innovation. Upload your photograph and witness our atelier's AI craft your personal fashion avatar, ready to showcase our exclusive menswear collection with unparalleled sophistication.
              </p>
              <div className="w-24 sm:w-32 h-0.5 bg-gradient-to-r from-yellow-600 to-yellow-500 mx-auto lg:mx-0 mb-6 lg:mb-10"></div>
              <div className="flex flex-col items-center lg:items-start w-full gap-4">
                <label htmlFor="image-upload-start" className="w-full relative flex items-center justify-center btn-primary text-sm sm:text-base cursor-pointer">
                  <UploadCloudIcon className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-4" />
                  BEGIN YOUR TRANSFORMATION
                </label>
                <input id="image-upload-start" type="file" className="hidden" accept="image/png, image/jpeg, image/webp, image/avif, image/heic, image/heif" onChange={handleFileChange} />
                <p className="text-gray-400 text-sm sm:text-base text-center lg:text-left font-light leading-relaxed px-2 lg:px-0">Select a clear, full-body photograph. Portrait compositions are acceptable, though full-body images yield optimal results for our luxury fitting experience.</p>
                <p className="text-gray-500 text-xs sm:text-sm mt-2 text-center lg:text-left font-light px-2 lg:px-0">By proceeding, you consent to responsible and lawful use of our premium AI styling atelier.</p>
                {error && <p className="text-red-400 text-sm sm:text-base mt-4 p-3 sm:p-4 glass-panel rounded-lg border border-red-400/30 luxury-glow">{error}</p>}
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2 flex flex-col items-center justify-center animate-luxury-zoom-in px-4 lg:px-0">
            <Compare
              firstImage="https://storage.googleapis.com/gemini-95-icons/asr-tryon.jpg"
              secondImage="https://storage.googleapis.com/gemini-95-icons/asr-tryon-model.png"
              slideMode="drag"
              className="w-full max-w-xs sm:max-w-sm aspect-[2/3] rounded-2xl bg-gray-900 border-2 border-yellow-600/30 shadow-lg luxury-card-3d luxury-glow"
            />
            <div className="mt-4 sm:mt-6 text-center">
              <p className="gold-accent font-semibold text-xs sm:text-sm uppercase tracking-wider">Drag to Compare</p>
              <p className="text-gray-400 text-xs mt-1 sm:mt-2 font-light">Witness the transformation in real-time</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-7xl mx-auto h-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-16 animate-luxury-slide-up px-4">
          <div className="md:w-1/2 flex-shrink-0 flex flex-col items-center md:items-start luxury-card-3d p-6 md:p-10">
            <div className="text-center md:text-left max-w-lg w-full">
              <div className="flex items-center justify-center md:justify-start mb-4">
                <div className="w-2 h-2 bg-yellow-600 rounded-full mr-3"></div>
                <span className="gold-accent font-semibold tracking-wider uppercase text-xs sm:text-sm">Transformation Complete</span>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl luxury-heading leading-tight mb-4 sm:mb-6">
                Your Bespoke
                <br />
                <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-light tracking-wider gold-accent">AVATAR</span>
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed font-light px-2 md:px-0">
                Witness your metamorphosis. Drag the slider to reveal your sophisticated digital persona, meticulously crafted for the finest menswear experience.
              </p>
            </div>
            
            {isGenerating && (
              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base lg:text-lg gold-accent mt-6 sm:mt-10 glass-panel p-4 sm:p-6 rounded-lg luxury-glow">
                <Spinner />
                <span>Crafting your bespoke avatar...</span>
              </div>
            )}

            {error && 
              <div className="text-center md:text-left text-red-400 max-w-md mt-6 sm:mt-10 glass-panel p-4 sm:p-6 rounded-lg border border-red-400/30 luxury-glow">
                <p className="font-bold text-base sm:text-lg mb-2 sm:mb-3">Transformation Interrupted</p>
                <p className="text-sm sm:text-base mb-3 sm:mb-4">{error}</p>
                <button onClick={reset} className="text-sm sm:text-base font-semibold gold-accent hover:text-yellow-400 transition-colors">Retry Transformation</button>
              </div>
            }
            
              {generatedModelUrl && !isGenerating && !error && (
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 mt-6 sm:mt-10 animate-luxury-fade-in w-full">
                  <button 
                    onClick={reset}
                    className="w-full sm:w-auto btn-secondary text-sm sm:text-base cursor-pointer"
                  >
                    SELECT DIFFERENT IMAGE
                  </button>
                  <button 
                    onClick={() => onModelFinalized(generatedModelUrl)}
                    className="w-full sm:w-auto btn-primary text-sm sm:text-base cursor-pointer"
                  >
                    ENTER ATELIER →
                  </button>
                </div>
              )}
          </div>
          <div className="md:w-1/2 w-full flex items-center justify-center px-4 md:px-0">
            <div 
              className={`relative rounded-2xl transition-all duration-300 ease-in-out luxury-card-3d ${isGenerating ? 'border-2 border-yellow-500 luxury-glow-intense' : 'border-2 border-yellow-600/30'}`}
            >
              <Compare
                firstImage={userImageUrl}
                secondImage={generatedModelUrl ?? userImageUrl}
                slideMode="drag"
                className="w-[240px] h-[360px] sm:w-[280px] sm:h-[420px] md:w-[320px] md:h-[480px] lg:w-[400px] lg:h-[600px] rounded-2xl bg-gray-900 shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StartScreen;
