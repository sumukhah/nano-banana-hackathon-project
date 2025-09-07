import React from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Music } from 'lucide-react'
import { useBook } from '../context/BookContext'

export const AudioControls: React.FC = () => {
  const { audioState, setVolume, toggleAudio } = useBook()

  return (
    <motion.div
      className="fixed top-6 right-6 z-50"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div className="audio-controls flex items-center gap-4">
        {/* Music indicator */}
        {audioState.currentTrack && (
          <motion.div
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Music size={16} className={`text-leather-600 ${audioState.isPlaying ? 'animate-pulse' : ''}`} />
            <span className="font-book text-sm text-leather-700">
              {audioState.isPlaying ? 'Playing' : 'Paused'}
            </span>
          </motion.div>
        )}

        {/* Volume control */}
        <div className="flex items-center gap-3">
          <motion.button
            onClick={toggleAudio}
            className="p-2 hover:bg-leather-300/50 rounded-full transition-colors duration-200"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            disabled={!audioState.currentTrack}
          >
            {audioState.isPlaying ? (
              <Volume2 size={18} className="text-leather-700" />
            ) : (
              <VolumeX size={18} className="text-leather-500" />
            )}
          </motion.button>

          {/* Volume slider */}
          <div className="relative group">
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={audioState.volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 bg-leather-300 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #a66d56 0%, #a66d56 ${audioState.volume * 100}%, #dcc8b8 ${audioState.volume * 100}%, #dcc8b8 100%)`
              }}
            />
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-leather-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {Math.round(audioState.volume * 100)}%
            </div>
          </div>
        </div>
      </div>

    </motion.div>
  )
}