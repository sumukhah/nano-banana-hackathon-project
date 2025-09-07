import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Volume2, VolumeX, BookOpen } from 'lucide-react'
import { useBook } from '../context/BookContext'
import { PageContent } from './PageContent'
import { AudioControls } from './AudioControls'
import { BookCover } from './BookCover'

export const BookReader: React.FC = () => {
  const { bookData, currentPageIndex, currentPage, nextPage, prevPage } = useBook()
  const [showCover, setShowCover] = useState(true)

  if (!bookData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leather-600"></div>
        <span className="ml-4 font-book text-leather-600">Loading your book...</span>
      </div>
    )
  }

  if (showCover) {
    return <BookCover onStartReading={() => setShowCover(false)} />
  }

  const canGoNext = currentPageIndex < bookData.pages.length - 1
  const canGoPrev = currentPageIndex > 0

  console.log('BookReader - Navigation state:', { 
    currentPageIndex, 
    totalPages: bookData.pages.length, 
    canGoNext, 
    canGoPrev
  })

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background ambiance */}
      <div className=" inset-0 bg-gradient-to-br from-parchment-50 via-parchment-100 to-parchment-200 opacity-80" />
      <div className=" inset-0 bg-paper opacity-30" />
      
      {/* Floating audio controls */}
      <AudioControls />
      
      {/* Book container */}
      <div className="relative max-w-6xl w-full flex items-center justify-center">
        {/* Left page shadow */}
        <motion.div 
          className="absolute left-0 w-8 h-full bg-gradient-to-r from-leather-800/20 to-transparent rounded-l-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
        
        {/* Main book */}
        <motion.div
          className="relative bg-white shadow-2xl rounded-lg overflow-hidden"
          style={{
            width: '900px',
            height: '700px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(139, 69, 19, 0.1)'
          }}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* Book binding */}
          <div className="absolute left-0 top-0 bottom-0 w-3 bg-gradient-to-b from-leather-700 to-leather-900 shadow-inner" />
          
          {/* Page content with animation */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentPageIndex}
              className="absolute inset-0 ml-3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <PageContent page={currentPage} />
            </motion.div>
          </AnimatePresence>
        </motion.div>
        
        {/* Right page shadow */}
        <motion.div 
          className="absolute right-0 w-8 h-full bg-gradient-to-l from-leather-800/20 to-transparent rounded-r-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      {/* Navigation */}
      <motion.div 
        className="mt-8 flex items-center gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <motion.button
          onClick={prevPage}
          className="navigation-button p-3 rounded-full flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft size={20} />
          <span className="font-book">Previous</span>
        </motion.button>
        
        <div className="flex items-center gap-3 px-4 py-2 bg-leather-100/60 rounded-full border border-leather-200/50">
          <BookOpen size={16} className="text-leather-600" />
          <span className="page-number">
            Page {currentPageIndex + 1} of {bookData.pages.length}
          </span>
        </div>
        
        <motion.button
          onClick={() => {
            console.log('Next button clicked! canGoNext:', canGoNext, 'currentPageIndex:', currentPageIndex)
            nextPage()
          }}
          className="navigation-button p-3 rounded-full flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="font-book">Next</span>
          <ChevronRight size={20} />
        </motion.button>
      </motion.div>
      
      {/* Progress indicator */}
      <motion.div 
        className="mt-4 w-64 h-1 bg-leather-200/50 rounded-full overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <motion.div
          className="h-full bg-gradient-to-r from-leather-500 to-leather-600 rounded-full"
          initial={{ width: 0 }}
          animate={{ 
            width: `${((currentPageIndex + 1) / bookData.pages.length) * 100}%` 
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  )
}