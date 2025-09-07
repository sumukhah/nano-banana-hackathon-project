import React from 'react'
import { motion } from 'framer-motion'
import { BookPage } from '../types/book'

interface PageContentProps {
  page: BookPage | null
}

export const PageContent: React.FC<PageContentProps> = ({ page }) => {
  if (!page) {
    return (
      <div className="book-page h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-leather-600 mx-auto mb-4"></div>
          <p className="font-book text-leather-600">Loading page...</p>
        </div>
      </div>
    )
  }

  // Format text with proper paragraphs
  const formatText = (text: string) => {
    return text
      .split('\\n\\n')
      .filter(paragraph => paragraph.trim().length > 0)
      .map((paragraph, index) => (
        <motion.p
          key={index}
          className="page-text mb-4 last:mb-0"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          {paragraph.replace(/\\n/g, ' ').trim()}
        </motion.p>
      ))
  }

  return (
    <div className="book-page h-full flex flex-col">
      {/* Page header - simplified */}
      <div className="flex-none p-4 pb-2">
        <div className="flex justify-end">
          <motion.div
            className="page-number"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {page.page_num}
          </motion.div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6">
          {/* Visuals section */}
          {page.visuals.length > 0 && (
            <motion.div
              className="mb-6"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex flex-col gap-4">
                {page.visuals.slice(0, 2).map((visual, index) => (
                  <motion.div
                    key={visual.placement_id}
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <img
                      src={`/${visual.image_path}`}
                      alt=""
                      className="book-image max-w-full"
                      style={{
                        height: '300px',
                        width: 'auto',
                        objectFit: 'contain'
                      }}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjZjVmMWU4Ii8+CjxyZWN0IHg9IjEwIiB5PSIxMCIgd2lkdGg9IjM4MCIgaGVpZ2h0PSIyODAiIHN0cm9rZT0iIzhjNjQzZCIgc3Ryb2tlLXdpZHRoPSIyIiBmaWxsPSJub25lIi8+Cjx0ZXh0IHg9IjIwMCIgeT0iMTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjOGM2NDNkIiBmb250LWZhbWlseT0ic2VyaWYiIGZvbnQtc2l6ZT0iMTYiPkdlbmVyYXRlZCBJbWFnZTwvdGV4dD4KPC9zdmc+'
                      }}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Text content */}
          <motion.div
            className="prose prose-lg max-w-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {formatText(page.text)}
          </motion.div>

        </div>
      </div>
    </div>
  )
}