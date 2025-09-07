import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { BookData, BookPage, AudioState } from '../types/book'

interface BookContextType {
  bookData: BookData | null
  currentPageIndex: number
  currentPage: BookPage | null
  audioState: AudioState
  setCurrentPageIndex: (index: number) => void
  nextPage: () => void
  prevPage: () => void
  setVolume: (volume: number) => void
  toggleAudio: () => void
}

const BookContext = createContext<BookContextType | undefined>(undefined)

export const useBook = () => {
  const context = useContext(BookContext)
  if (!context) {
    throw new Error('useBook must be used within a BookProvider')
  }
  return context
}

export const BookProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [bookData, setBookData] = useState<BookData | null>(null)
  const [currentPageIndex, setCurrentPageIndex] = useState(0)
  const [audioState, setAudioState] = useState<AudioState>({
    currentTrack: null,
    isPlaying: false,
    volume: 0.3,
    isLoading: false
  })

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load book data on mount
  useEffect(() => {
    const loadBookData = async () => {
      try {
        // Load the generated content
        const response = await fetch('/generated_content/final_output.json')
        if (!response.ok) {
          throw new Error('Failed to load book data')
        }
        
        const pages = await response.json()
        
        const filteredPages = pages.filter((page: BookPage) => 
          page.text.trim().length > 50 || page.visuals.length > 0 || page.music.length > 0
        )
        
        console.log('Loaded pages:', filteredPages.length)
        console.log('Sample pages:', filteredPages.slice(0, 3))
        console.log('First few page nums:', filteredPages.slice(0, 5).map(p => p.page_num))
        console.log('Text lengths:', filteredPages.slice(0, 5).map(p => p.text.length))
        
        const bookData: BookData = {
          title: 'The Alchemist',
          author: 'Paulo Coelho',
          pages: filteredPages
        }
        
        setBookData(bookData)
      } catch (error) {
        console.error('Error loading book data:', error)
        // Fallback demo data
        setBookData({
          title: 'The Alchemist',
          author: 'Paulo Coelho',
          pages: [
            {
              page_num: 1,
              text: 'The Alchemist by Paulo Coelho\\n\\nA beautiful story of Santiago, a young shepherd boy who dreams of finding treasure...',
              visuals: [],
              music: []
            }
          ]
        })
      }
    }

    loadBookData()
  }, [])

  // Audio management
  useEffect(() => {
    if (!bookData) return

    const currentPage = bookData.pages[currentPageIndex]
    if (!currentPage || currentPage.music.length === 0) {
      fadeOutCurrentTrack()
      return
    }

    const newTrack = `/${currentPage.music[0].audio_path}`
    
    if (audioState.currentTrack !== newTrack) {
      fadeToNewTrack(newTrack)
    }
  }, [currentPageIndex, bookData])

  const fadeToNewTrack = (newTrackUrl: string) => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    // Fade out current track
    if (audioRef.current && audioState.isPlaying) {
      let currentVolume = audioState.volume
      fadeIntervalRef.current = setInterval(() => {
        currentVolume -= 0.05
        if (currentVolume <= 0) {
          if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = newTrackUrl
            audioRef.current.volume = 0
            audioRef.current.play()
            fadeInNewTrack()
          }
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current)
          }
        } else if (audioRef.current) {
          audioRef.current.volume = currentVolume
        }
      }, 100)
    } else {
      // No current track, just start the new one
      if (audioRef.current) {
        audioRef.current.src = newTrackUrl
        audioRef.current.volume = 0
        audioRef.current.play()
        fadeInNewTrack()
      }
    }

    setAudioState(prev => ({ ...prev, currentTrack: newTrackUrl, isPlaying: true }))
  }

  const fadeInNewTrack = () => {
    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    let currentVolume = 0
    fadeIntervalRef.current = setInterval(() => {
      currentVolume += 0.02
      if (currentVolume >= audioState.volume) {
        if (audioRef.current) {
          audioRef.current.volume = audioState.volume
        }
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
        }
      } else if (audioRef.current) {
        audioRef.current.volume = currentVolume
      }
    }, 100)
  }

  const fadeOutCurrentTrack = () => {
    if (!audioRef.current || !audioState.isPlaying) return

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current)
    }

    let currentVolume = audioState.volume
    fadeIntervalRef.current = setInterval(() => {
      currentVolume -= 0.05
      if (currentVolume <= 0) {
        if (audioRef.current) {
          audioRef.current.pause()
        }
        setAudioState(prev => ({ ...prev, isPlaying: false, currentTrack: null }))
        if (fadeIntervalRef.current) {
          clearInterval(fadeIntervalRef.current)
        }
      } else if (audioRef.current) {
        audioRef.current.volume = currentVolume
      }
    }, 100)
  }

  const nextPage = useCallback(() => {
    console.log('NextPage called, current index:', currentPageIndex, 'total pages:', bookData?.pages.length)
    if (bookData) {
      setCurrentPageIndex(prev => {
        const nextIndex = prev + 1
        // Wrap to beginning if at end
        return nextIndex >= bookData.pages.length ? 0 : nextIndex
      })
    }
  }, [currentPageIndex, bookData])

  const prevPage = useCallback(() => {
    console.log('PrevPage called, current index:', currentPageIndex)
    if (bookData) {
      setCurrentPageIndex(prev => {
        // Wrap to end if at beginning
        return prev <= 0 ? bookData.pages.length - 1 : prev - 1
      })
    }
  }, [currentPageIndex, bookData])

  const setVolume = (volume: number) => {
    setAudioState(prev => ({ ...prev, volume }))
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioState.isPlaying) {
        audioRef.current.pause()
        setAudioState(prev => ({ ...prev, isPlaying: false }))
      } else {
        audioRef.current.play()
        setAudioState(prev => ({ ...prev, isPlaying: true }))
      }
    }
  }

  const currentPage = bookData ? bookData.pages[currentPageIndex] : null

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio()
      audioRef.current.loop = true
      audioRef.current.volume = audioState.volume
    }

    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current)
      }
    }
  }, [])

  return (
    <BookContext.Provider
      value={{
        bookData,
        currentPageIndex,
        currentPage,
        audioState,
        setCurrentPageIndex,
        nextPage,
        prevPage,
        setVolume,
        toggleAudio,
      }}
    >
      {children}
    </BookContext.Provider>
  )
}