# Don’t Just Read, Live the Story  

Built in 8 hours at a hackathon, StoryScape transforms any PDF book into a living adventure with AI-generated visuals, adaptive soundscapes, and consistent characters.  

Instead of reading static text, you can walk alongside characters, see their world unfold, and hear the emotions of every scene.  

---

## Features  

- PDF Input → Upload any book in PDF format.  
- Metadata Extraction (Gemini) → Detects characters, sections, and key story events.  
- Visual Consistency (Nano Banana) →  
  - Generates base images for each character once.  
  - Reuses them for consistency across all visuals.  
- Adaptive Soundscapes (ElevenLabs) → Short audio tracks matched to the mood of each scene.  
- Fast and Simple → Single Python script, no complex infra, minimal API calls.  
- Lightweight Storage → JSON + local images/audio files.  

---

## Tech Stack  

- [google-genai](https://pypi.org/project/google-genai/) → Gemini for text analysis and placement extraction  
- Nano Banana (Gemini Flash 2.5 image generation) → Character portraits and consistent visuals  
- [ElevenLabs](https://elevenlabs.io/) → Dynamic audio/music generation  
- [PyPDF2](https://pypi.org/project/PyPDF2/) → PDF parsing  
- requests → API calls  
- python-dotenv → API key management  

---

## Project Structure  

StoryScape/
┣ script.py # Main system script (all logic in one file)
┣ outputs/ # Generated images and audio
┃ ┣ base_characters/ # Reference portraits
┃ ┣ visuals/ # Scene visuals
┃ ┗ music/ # Scene-specific audio
┣ characters.json # Extracted characters + references
┣ sections.json # Extracted sections + summaries
┗ requirements.txt # Dependencies


---

## System Flow  

1. Extract PDF text → Page-wise text stored in memory  
2. Metadata Extraction (Gemini) → Characters and sections in JSON  
3. Base Image Generation (Nano Banana) → Consistent character portraits  
4. Placement Detection (Gemini) → Where to add visuals and music  
5. Scene Visuals (Nano Banana) → Images using base portraits  
6. Music Generation (ElevenLabs) → Scene-specific audio tracks  
7. Compile Outputs → Per page: text, visuals, and music in structured JSON  

---

## Quick Start  

1. Clone repo and install dependencies:  
Add your API keys to .env:

- GEMINI_API_KEY=your_key_here
- NANO_BANANA_API_KEY=your_key_here
- ELEVENLABS_API_KEY=your_key_here


2. Run the script with your PDF:
python script.py --pdf your_book.pdf

Check outputs/ for generated images, audio, and the final compiled.json.

## Requirements:
* google-genai==1.33.0
* PyPDF2==3.0.1
* requests==2.32.5
* python-dotenv==1.1.1


Hackathon Philosophy
- All logic in one file (script.py)
- Minimal steps, end-to-end in a single run
- API calls only where needed
- Focused on being demo-ready in under 48 hours
