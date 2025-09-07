#!/usr/bin/env python3
"""
Story Book Generator - Hackathon Project
Generates images and music for PDF books using Gemini and ElevenLabs APIs
"""

import os
import json
import base64
import mimetypes
import time
import requests
from dotenv import load_dotenv
import PyPDF2
from google import genai
from google.genai import types

# Load environment variables
load_dotenv()

# Configuration
PDF_PATH = os.getenv('PDF_PATH', 'sample_book.pdf')  # Hardcoded path fallback
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')

# Processing limits for testing/demo
MAX_CHARACTERS = 5  # Limit number of characters to process
MAX_SECTIONS = 5    # Limit number of sections/chapters to process

# Output directories
OUTPUT_DIR = 'generated_content'
IMAGES_DIR = f'{OUTPUT_DIR}/images'
MUSIC_DIR = f'{OUTPUT_DIR}/music'
BASE_IMAGES_DIR = f'{OUTPUT_DIR}/base_characters'

def setup_directories():
    """Create necessary output directories"""
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(IMAGES_DIR, exist_ok=True)
    os.makedirs(MUSIC_DIR, exist_ok=True)
    os.makedirs(BASE_IMAGES_DIR, exist_ok=True)

def save_binary_file(file_name, data):
    """Save binary data to file"""
    with open(file_name, "wb") as f:
        f.write(data)
    print(f"File saved to: {file_name}")

def extract_pdf_text(pdf_path):
    """Extract text from PDF, both full text and page-wise"""
    print(f"Extracting text from: {pdf_path}")
    
    with open(pdf_path, 'rb') as file:
        reader = PyPDF2.PdfReader(file)
        full_text = ""
        page_texts = []
        
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            full_text += page_text
            page_texts.append({
                "page": i + 1,
                "text": page_text
            })
    
    print(f"Extracted {len(page_texts)} pages")
    return full_text, page_texts

def extract_metadata_with_gemini(full_text):
    """Extract character and section metadata using Gemini"""
    print("Extracting metadata with Gemini...")
    print(f"Text length: {len(full_text)} characters")
    
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    prompt = f"""
    Analyze this book text and extract metadata in strict JSON format.
    
    Focus on STORY CONTENT ONLY - ignore table of contents, reviews, forewords, and other preliminary material.
    Only extract actual story chapters/sections where narrative events occur.
    
    Output format:
    {{
        "characters": [
            {{
                "name": "Character Name",
                "detailed_appearance": "Detailed visual description for image generation including clothing, build, facial features, hair, etc."
            }}
        ],
        "sections": [
            {{
                "title": "Chapter/Section Title",
                "page_start": 1,
                "page_end": 5,
                "summary": "Brief chapter summary"
            }}
        ]
    }}
    
    IMPORTANT: For sections, skip any that are:
    - Table of contents
    - Reviews/acclaim
    - Forewords/prefaces  
    - About the author
    - Copyright pages
    
    Only include actual story narrative sections like "Prologue", "Part One", "Chapter 1", etc.
    
    Book text:
    {full_text[:15000]}
    
    Return only valid JSON, no other text.
    """
    
    print("Sending request to Gemini...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    
    print(f"Received response from Gemini")
    print(f"Raw response (first 1000 chars): {response.text[:1000]}")
    
    try:
        # Clean the response - remove markdown code blocks if present
        clean_response = response.text.strip()
        if clean_response.startswith('```json'):
            clean_response = clean_response[7:]  # Remove ```json
        if clean_response.endswith('```'):
            clean_response = clean_response[:-3]  # Remove trailing ```
        clean_response = clean_response.strip()
        
        metadata = json.loads(clean_response)
        print(f"Successfully parsed JSON metadata")
        # Save metadata to files
        with open(f'{OUTPUT_DIR}/characters.json', 'w') as f:
            json.dump(metadata['characters'], f, indent=2)
        with open(f'{OUTPUT_DIR}/sections.json', 'w') as f:
            json.dump(metadata['sections'], f, indent=2)
        
        print(f"Found {len(metadata['characters'])} characters and {len(metadata['sections'])} sections")
        return metadata['characters'], metadata['sections']
    except json.JSONDecodeError as e:
        print(f"ERROR: Failed to parse JSON from Gemini response: {e}")
        print(f"Full response text: {response.text}")
        return [], []

def generate_image_with_gemini(prompt, file_name, reference_images=None):
    """Generate image using Gemini Flash image generation"""
    print(f"DEBUG: Generating image: {file_name}")
    print(f"DEBUG: Image prompt (first 200 chars): {prompt[:200]}...")
    
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    # Build parts list - start with text prompt
    parts = [types.Part.from_text(text=prompt)]
    
    # Add reference images if provided
    if reference_images:
        print(f"DEBUG: Adding {len(reference_images)} reference images")
        for img_path in reference_images:
            if os.path.exists(img_path):
                print(f"DEBUG: Loading reference image: {img_path}")
                with open(img_path, 'rb') as f:
                    image_data = f.read()
                parts.append(types.Part.from_bytes(data=image_data, mime_type="image/png"))
            else:
                print(f"DEBUG: Reference image not found: {img_path}")
    
    contents = [
        types.Content(
            role="user",
            parts=parts,
        ),
    ]
    
    generate_content_config = types.GenerateContentConfig(
        response_modalities=["IMAGE", "TEXT"],
    )
    
    for chunk in client.models.generate_content_stream(
        model="gemini-2.5-flash-image-preview",
        contents=contents,
        config=generate_content_config,
    ):
        if (
            chunk.candidates is None
            or chunk.candidates[0].content is None
            or chunk.candidates[0].content.parts is None
        ):
            continue
            
        if chunk.candidates[0].content.parts[0].inline_data and chunk.candidates[0].content.parts[0].inline_data.data:
            inline_data = chunk.candidates[0].content.parts[0].inline_data
            data_buffer = inline_data.data
            file_extension = mimetypes.guess_extension(inline_data.mime_type) or '.png'
            full_path = f"{file_name}{file_extension}"
            save_binary_file(full_path, data_buffer)
            print(f"DEBUG: Successfully generated image: {full_path}")
            return full_path
    
    print(f"DEBUG: Failed to generate image for {file_name}")
    return None

def generate_base_character_images(characters):
    """Generate base images for each character for consistency"""
    print(f"DEBUG: Generating base character images for {len(characters)} characters...")
    
    for i, character in enumerate(characters):
        name = character['name']
        appearance = character['detailed_appearance']
        print(f"DEBUG: Processing character {i+1}/{len(characters)}: {name}")
        
        # Check if base image already exists
        file_name = f"{BASE_IMAGES_DIR}/base_{name.replace(' ', '_').lower()}"
        existing_png = f"{file_name}.png"
        existing_jpeg = f"{file_name}.jpeg"
        existing_jpg = f"{file_name}.jpg"
        
        if os.path.exists(existing_png):
            character['base_image_path'] = existing_png
            print(f"DEBUG: Using existing base image for {name}: {existing_png}")
            continue
        elif os.path.exists(existing_jpeg):
            character['base_image_path'] = existing_jpeg
            print(f"DEBUG: Using existing base image for {name}: {existing_jpeg}")
            continue
        elif os.path.exists(existing_jpg):
            character['base_image_path'] = existing_jpg
            print(f"DEBUG: Using existing base image for {name}: {existing_jpg}")
            continue
        
        # Generate new base image if it doesn't exist
        print(f"DEBUG: No existing base image found, generating new one for {name}")
        prompt = f"A neutral portrait of {name} with {appearance}, front-facing, plain background, high quality"
        
        image_path = generate_image_with_gemini(prompt, file_name)
        
        if image_path:
            character['base_image_path'] = image_path
            print(f"DEBUG: Generated new base image for {name}")
        else:
            print(f"DEBUG: Failed to generate base image for {name}")
        
        # Small delay to respect API limits
        print(f"DEBUG: Sleeping 2 seconds...")
        time.sleep(2)
    
    # Update characters.json with image paths
    with open(f'{OUTPUT_DIR}/characters.json', 'w') as f:
        json.dump(characters, f, indent=2)

def analyze_chapter_for_placements(chapter_text, characters, chapter_title):
    """Analyze chapter text to identify optimal placements for images and music"""
    print(f"DEBUG: Analyzing placements for: {chapter_title}")
    print(f"DEBUG: Chapter text length: {len(chapter_text)} characters")
    print(f"DEBUG: Available characters: {len(characters)}")
    
    client = genai.Client(api_key=GEMINI_API_KEY)
    
    character_names = [char['name'] for char in characters]
    
    prompt = f"""
    Analyze this chapter text to identify optimal placements for images and music.
    
    Available characters: {', '.join(character_names)}
    
    For VISUALS: Identify 3-5 key scenes where images would significantly enhance understanding or engagement.
    For MUSIC: Only identify music placements where audio would dramatically enhance the emotional impact or atmosphere. Music should be reserved for:
    - Moments of high tension, suspense, or drama
    - Emotional climaxes or revelations  
    - Mystical or supernatural scenes
    - Action sequences or pivotal moments
    Do NOT add music to ordinary dialogue, descriptions, or mundane scenes.
    
    Output in strict JSON format:
    {{
        "visuals": [
            {{
                "placement_id": "chapter_title_scene1",
                "description": "Detailed scene description for image generation",
                "relevant_characters": ["Character Name 1", "Character Name 2"]
            }}
        ],
        "music": [
            {{
                "placement_id": "chapter_title_music1", 
                "description": "Music style and mood description (e.g., 'dramatic orchestral crescendo for revelation moment, 30 seconds')"
            }}
        ]
    }}
    
    Chapter: {chapter_title}
    Text: {chapter_text[:8000]}
    
    Return only valid JSON, no other text.
    """
    
    print(f"DEBUG: Sending placement analysis request to Gemini...")
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    
    print(f"DEBUG: Received placement response (first 500 chars): {response.text[:500]}...")
    
    try:
        # Clean the response - remove markdown code blocks if present
        clean_response = response.text.strip()
        if clean_response.startswith('```json'):
            clean_response = clean_response[7:]  # Remove ```json
        if clean_response.endswith('```'):
            clean_response = clean_response[:-3]  # Remove trailing ```
        clean_response = clean_response.strip()
        
        placements = json.loads(clean_response)
        visuals = placements.get('visuals', [])
        music = placements.get('music', [])
        print(f"DEBUG: Found {len(visuals)} visual placements and {len(music)} music placements")
        return visuals, music
    except json.JSONDecodeError as e:
        print(f"DEBUG: Error parsing placements for {chapter_title}: {e}")
        print(f"DEBUG: Full placement response: {response.text}")
        return [], []

def generate_scene_images(visual_placements, characters):
    """Generate images for identified visual placements with character consistency"""
    print(f"DEBUG: Generating scene images for {len(visual_placements)} placements...")
    
    # Create character lookup
    character_lookup = {char['name']: char for char in characters}
    print(f"DEBUG: Character lookup created for: {list(character_lookup.keys())}")
    
    for i, placement in enumerate(visual_placements):
        print(f"DEBUG: Processing visual placement {i+1}/{len(visual_placements)}")
        placement_id = placement['placement_id']
        description = placement['description']
        relevant_char_names = placement.get('relevant_characters', [])
        
        # Build prompt with character references and collect base images
        prompt = f"Generate this scene: {description}. "
        reference_images = []
        
        if relevant_char_names:
            char_descriptions = []
            for char_name in relevant_char_names:
                if char_name in character_lookup:
                    char = character_lookup[char_name]
                    char_descriptions.append(f"{char_name}: {char['detailed_appearance']}")
                    # Add base image path if it exists
                    if 'base_image_path' in char and char['base_image_path']:
                        reference_images.append(char['base_image_path'])
            
            if char_descriptions:
                prompt += f"Use the attached reference images to maintain character consistency. Characters involved: " + ", ".join(char_descriptions)
        
        print(f"DEBUG: Using {len(reference_images)} reference images for scene: {placement_id}")
        
        file_name = f"{IMAGES_DIR}/visual_{placement_id}"
        image_path = generate_image_with_gemini(prompt, file_name, reference_images)
        
        if image_path:
            placement['image_path'] = image_path
            print(f"DEBUG: Generated scene image: {placement_id}")
        else:
            print(f"DEBUG: Failed to generate scene image: {placement_id}")
        
        # Delay for API limits
        print(f"DEBUG: Sleeping 3 seconds...")
        time.sleep(3)

def generate_music_with_elevenlabs(music_placements):
    """Generate music for identified music placements"""
    print(f"DEBUG: Generating music with ElevenLabs for {len(music_placements)} placements...")
    
    for i, placement in enumerate(music_placements):
        print(f"DEBUG: Processing music placement {i+1}/{len(music_placements)}")
        placement_id = placement['placement_id']
        description = placement['description']
        
        try:
            # Generate sound effect/music using ElevenLabs API
            url = "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128"
            headers = {
                "xi-api-key": ELEVENLABS_API_KEY,
                "Content-Type": "application/json"
            }
            data = {
                "text": description,
                "duration_seconds": 20,  # ElevenLabs max is 22 seconds
                "loop": False
            }
            
            print(f"DEBUG: Sending request to ElevenLabs for: {description[:100]}...")
            print(f"DEBUG: ElevenLabs request data: {data}")
            response = requests.post(url, headers=headers, json=data)
            
            print(f"DEBUG: ElevenLabs response status: {response.status_code}")
            print(f"DEBUG: ElevenLabs response headers: {dict(response.headers)}")
            print(f"DEBUG: ElevenLabs response content length: {len(response.content)}")
            
            if response.status_code == 200:
                # Save audio file
                audio_path = f"{MUSIC_DIR}/music_{placement_id}.mp3"
                with open(audio_path, 'wb') as f:
                    f.write(response.content)
                
                placement['audio_path'] = audio_path
                print(f"DEBUG: Successfully generated and saved music: {placement_id}")
            else:
                print(f"DEBUG: ElevenLabs API error {response.status_code}: {response.text}")
                try:
                    error_json = response.json()
                    print(f"DEBUG: ElevenLabs error details: {json.dumps(error_json, indent=2)}")
                except:
                    print(f"DEBUG: Could not parse error response as JSON")
            
        except Exception as e:
            print(f"DEBUG: Error generating music for {placement_id}: {e}")
        
        # Delay for API limits
        print(f"DEBUG: Sleeping 3 seconds...")
        time.sleep(3)

def compile_final_output(page_texts, all_visual_placements, all_music_placements):
    """Compile final page-by-page output structure"""
    print("Compiling final output...")
    print(f"DEBUG: Total visual placements: {len(all_visual_placements)}")
    print(f"DEBUG: Total music placements: {len(all_music_placements)}")
    
    final_output = []
    
    for page_data in page_texts:
        page_num = page_data['page']
        page_text = page_data['text']
        
        # Find visuals for this specific page
        page_visuals = []
        for visual in all_visual_placements:
            if visual.get('image_path') and visual.get('page_start') and visual.get('page_end'):
                # Check if this page falls within the visual's section range
                if visual['page_start'] <= page_num <= visual['page_end']:
                    page_visuals.append({
                        'placement_id': visual['placement_id'],
                        'image_path': visual['image_path'],
                        'description': visual['description'],
                        'section': visual.get('section_title', 'Unknown')
                    })
        
        # Find music for this specific page  
        page_music = []
        for music in all_music_placements:
            if music.get('audio_path') and music.get('page_start') and music.get('page_end'):
                # Check if this page falls within the music's section range
                if music['page_start'] <= page_num <= music['page_end']:
                    page_music.append({
                        'placement_id': music['placement_id'],
                        'audio_path': music['audio_path'], 
                        'description': music['description'],
                        'section': music.get('section_title', 'Unknown')
                    })
                    
        # Also add content even if no visuals/music but has meaningful text
        meaningful_content = len(page_text.strip()) > 50  # At least 50 characters
        
        # Add all pages with meaningful content, visuals, or music
        if meaningful_content or page_visuals or page_music:
            final_output.append({
                'page_num': page_num,
                'text': page_text,
                'visuals': page_visuals,  # Include all visuals for this page
                'music': page_music       # Include all music for this page
            })
            
            if page_visuals:
                print(f"DEBUG: Added {len(page_visuals)} visuals to page {page_num}")
            if page_music:
                print(f"DEBUG: Added {len(page_music)} music to page {page_num}")
            if meaningful_content and not page_visuals and not page_music:
                print(f"DEBUG: Added page {page_num} with text content only")
    
    # Save final output
    with open(f'{OUTPUT_DIR}/final_output.json', 'w') as f:
        json.dump(final_output, f, indent=2)
    
    print(f"Final output saved with {len(final_output)} pages")
    return final_output

def main():
    """Main execution function"""
    print("Starting Story Book Generator...")
    
    # Setup
    setup_directories()
    
    # 1. Extract PDF text
    full_text, page_texts = extract_pdf_text(PDF_PATH)
    
    # 2. Extract metadata
    characters, sections = extract_metadata_with_gemini(full_text)
    
    # 3. Generate base character images
    generate_base_character_images(characters[:MAX_CHARACTERS])
    
    # 4. Process each chapter for placements
    all_visual_placements = []
    all_music_placements = []
    
    for section in sections[:MAX_SECTIONS]:
        chapter_title = section['title']
        page_start = section.get('page_start', 1)
        page_end = section.get('page_end', 1)
        
        # Extract actual chapter text from page range
        chapter_text = ""
        for page_data in page_texts[page_start-1:page_end]:
            chapter_text += page_data['text'] + "\n"
        
        print(f"DEBUG: Processing section '{chapter_title}' (pages {page_start}-{page_end})")
        print(f"DEBUG: Chapter text length: {len(chapter_text)} characters")
        
        visuals, music = analyze_chapter_for_placements(chapter_text, characters[:MAX_CHARACTERS], chapter_title)
        
        # Add section info to placements for proper mapping
        for visual in visuals:
            visual['section_title'] = chapter_title
            visual['page_start'] = page_start
            visual['page_end'] = page_end
        
        for music_item in music:
            music_item['section_title'] = chapter_title  
            music_item['page_start'] = page_start
            music_item['page_end'] = page_end
        
        all_visual_placements.extend(visuals)
        all_music_placements.extend(music)
    
    # 5. Generate scene images
    generate_scene_images(all_visual_placements, characters[:MAX_CHARACTERS])
    
    # 6. Generate music
    generate_music_with_elevenlabs(all_music_placements)
    
    # 7. Compile final output
    final_output = compile_final_output(page_texts, all_visual_placements, all_music_placements)
    
    print("\n=== GENERATION COMPLETE ===")
    print(f"Characters: {len(characters)}")
    print(f"Visual placements: {len(all_visual_placements)}")
    print(f"Music placements: {len(all_music_placements)}")
    print(f"Final output: {len(final_output)} pages")
    print(f"\nCheck the '{OUTPUT_DIR}' directory for all generated content")

if __name__ == "__main__":
    main()