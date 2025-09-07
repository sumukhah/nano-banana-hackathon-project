#!/usr/bin/env python3
"""
Test music generation with known placement data
"""

import os
import sys
import requests
import json
from dotenv import load_dotenv

load_dotenv()

def generate_music_test():
    """Test music generation with hardcoded placement"""
    
    # Simulate a music placement that should have been found
    music_placements = [
        {
            "placement_id": "test_dramatic_scene",
            "description": "A haunting and mystical melody with ethereal strings and soft choir voices, evoking the mystery of dreams and destiny, 18 seconds",
            "section_title": "Test",
            "page_start": 1,
            "page_end": 1
        }
    ]
    
    ELEVENLABS_API_KEY = os.getenv('ELEVENLABS_API_KEY')
    MUSIC_DIR = 'generated_content/music'
    
    # Ensure music directory exists
    os.makedirs(MUSIC_DIR, exist_ok=True)
    
    print(f"Testing music generation for {len(music_placements)} placements...")
    
    for i, placement in enumerate(music_placements):
        print(f"Processing music placement {i+1}/{len(music_placements)}")
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
                "duration_seconds": 18,
                "loop": False
            }
            
            print(f"Sending request to ElevenLabs for: {description[:100]}...")
            print(f"Request data: {data}")
            response = requests.post(url, headers=headers, json=data)
            
            print(f"ElevenLabs response status: {response.status_code}")
            print(f"Response content length: {len(response.content)}")
            
            if response.status_code == 200:
                # Save audio file
                audio_path = f"{MUSIC_DIR}/music_{placement_id}.mp3"
                with open(audio_path, 'wb') as f:
                    f.write(response.content)
                
                placement['audio_path'] = audio_path
                print(f"✅ Successfully generated and saved music: {audio_path}")
            else:
                print(f"❌ ElevenLabs API error {response.status_code}: {response.text}")
                try:
                    error_json = response.json()
                    print(f"Error details: {json.dumps(error_json, indent=2)}")
                except:
                    print("Could not parse error response as JSON")
            
        except Exception as e:
            print(f"❌ Error generating music for {placement_id}: {e}")

if __name__ == "__main__":
    generate_music_test()