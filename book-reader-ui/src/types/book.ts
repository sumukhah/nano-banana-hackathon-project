export interface BookPage {
  page_num: number
  text: string
  visuals: Visual[]
  music: Music[]
}

export interface Visual {
  placement_id: string
  image_path: string
  description: string
  section?: string
}

export interface Music {
  placement_id: string
  audio_path: string
  description: string
  section?: string
}

export interface BookData {
  title: string
  author: string
  pages: BookPage[]
}

export interface AudioState {
  currentTrack: string | null
  isPlaying: boolean
  volume: number
  isLoading: boolean
}