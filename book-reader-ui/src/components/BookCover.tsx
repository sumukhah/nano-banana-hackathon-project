import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Sparkles } from 'lucide-react'

interface BookCoverProps {
  onStartReading: () => void
}

export const BookCover: React.FC<BookCoverProps> = ({ onStartReading }) => {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-leather-900 via-leather-800 to-leather-900" />
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/20 via-transparent to-amber-700/10" />
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      {/* Book cover */}
      <motion.div
        className="relative"
        initial={{ scale: 0.8, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ duration: 1, ease: 'easeOut' }}
      >
        <div className="relative w-96 h-[500px] bg-gradient-to-br from-leather-800 to-leather-900 rounded-lg shadow-2xl overflow-hidden border-2 border-amber-600/30">
          {/* Cover texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-900/10 to-leather-900/50" />
          <div className="absolute inset-0 bg-paper opacity-20" />
          
          {/* Decorative border */}
          <div className="absolute inset-4 border-2 border-amber-600/40 rounded-lg" />
          
          {/* Title section */}
          <div className="relative z-10 h-full flex flex-col items-center justify-center text-center p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto mb-4" />
              
              <h1 className="book-title text-amber-100 mb-2">
                The Alchemist
              </h1>
              
              <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent mx-auto mb-4" />
              
              <p className="font-book text-amber-200/80 text-lg mb-8">
                Paulo Coelho
              </p>
              
              <motion.div
                className="text-amber-300/60 font-book text-sm leading-relaxed max-w-64"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                An enhanced interactive reading experience with AI-generated visuals and ambient music
              </motion.div>
            </motion.div>
            
            {/* Mystical symbol */}
            <motion.div
              className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, rotate: -180 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              <div className="w-16 h-16 border-2 border-amber-400/30 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border border-amber-400/50 rounded-full relative">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-amber-400/60 rounded-full" />
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Glow effects */}
          <div className=" -inset-1 bg-gradient-to-r from-amber-600/20 via-amber-400/10 to-amber-600/20 blur-xl" />
        </div>
        
        {/* Book spine shadow */}
        <div className=" -right-2 top-2 bottom-2 w-6 bg-gradient-to-r from-leather-900 to-black/50 rounded-r-lg transform skew-y-1" />
      </motion.div>
      {/* Start reading button */}
      <motion.button
        onClick={onStartReading}
        className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-book font-semibold px-8 py-4 rounded-full shadow-lg transition-all duration-300 flex items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(217, 119, 6, 0.4)' }}
        whileTap={{ scale: 0.95 }}
      >
        <BookOpen size={20} />
        Begin Your Journey
      </motion.button>
      
      {/* Ambient glow */}
      <div className=" inset-0 bg-gradient-radial from-amber-600/5 via-transparent to-transparent pointer-events-none" />
    </div>
  )
}