

Detailed Plan for Image and Music Generation System Architecture
This plan builds on the overall script flow for your hackathon project, focusing specifically on the image and music generation system. It incorporates the new requirement for generating base images for characters to ensure consistency across visuals. The architecture is designed to be efficient for a short hackathon timeline (e.g., remaining 1 day), prioritizing minimal steps, API efficiency, and modular processing. We'll use Gemini for text analysis and placement identification(good for image-to-image consistency, e.g., via reference images) for image generation, and ElevenLabs for music generation. All processing happens in a single Python script. for quick iteration and demo.
The system will handle PDF input, extract metadata, analyze for placements, generate base character images, then use those for consistent visual generation, and finally compile per-page outputs. Storage will be simple (local JSON files and image/audio files) to avoid complexity. For character consistency, base images act as "reference" inputs for subsequent generations—only relevant characters' base images are sent per visual prompt to optimize API calls and reduce noise.
1. Overall System Setup and Input Handling

Start by configuring API access for Gemini, nano banana, and ElevenLabs within the script environment. This includes setting API keys and initializing clients or models for quick calls.
Input the PDF file path manually or via a variable. Use a PDF parsing library (like PyPDF2) to extract the full text and page-wise text, storing the latter in memory as a list of dictionaries (e.g., each with page number and text content). This full text will be used for initial metadata extraction, while page texts support per-page output compilation.

2. Metadata Extraction Using Gemini

Send the entire PDF text to Gemini via a structured prompt to extract character and section metadata. The prompt should instruct Gemini to output in strict JSON format: a list of characters (each with "name" and "detailed_appearance" fields, focusing on visual traits like clothing, build, facial features for image gen) and a section list (chapters/sections with page_start, page_end, title, and summary).
Parse the Gemini response into Python dictionaries/lists.
Store the characters and sections as separate JSON files locally (e.g., "characters.json" and "sections.json"). This allows easy reloading if the script crashes during hackathon debugging.

3. Base Image Generation for Characters (Consistency Foundation)

Immediately after extracting characters, generate a "base image" for each one using nano banana(Gemini flash 2.5 image generation model). This step creates reference visuals that capture the character's core appearance, which will be reused for consistency in later scene-specific images.

For each character in the list, craft a simple prompt based on their "detailed_appearance" (e.g., "A neutral portrait of [name] with [appearance details], front-facing, plain background").
Call the nano banana API with this prompt, using quick generation parameters (e.g., low steps/iterations for speed, fixed seed for reproducibility if supported).
Save the generated image locally (e.g., as PNG files named "base_[character_name].png"). Also, update the characters JSON/dictionary to include a "base_image_path" field pointing to this file.


This base generation happens only once, upfront, to minimize redundant API calls. If a character has no detailed appearance, skip or use a generic prompt to avoid errors.

4. Chapter-by-Chapter Analysis for Placements Using Gemini

Loop through each section from the metadata.

Extract the full text for that chapter by slicing from the page_texts list based on page_start and page_end.
Send this chapter text to Gemini with a prompt to identify optimal placements for images and music:

For images: Spots where visuals "absolutely improve engagement" (e.g., key scenes, descriptions, actions). Output details like a unique placement_id (e.g., "chapter_title_pageX_paraY" for frontend anchoring), and a detailed description of the image needed. Crucially, include a list of "relevant_characters" involved in that scene (by cross-referencing the full characters list).
For music: Spots enhancing emotion/engagement (e.g., tension builds, horror peaks). Output placement_id and description (e.g., "horror suspense music, 30 seconds").


Prompt Gemini to output in JSON: separate lists for visuals and music, each item with placement_id, description, and (for visuals) relevant_characters (as a list of names).


Aggregate these placements in memory (e.g., dictionaries keyed by chapter title for visuals and music). This step identifies "what" and "where" without generating yet, keeping it fast.

5. Image Generation with Character Consistency

Process all identified visual placements chapter-by-chapter or in batches to manage API rate limits.

For each visual placement:

From the placement's "relevant_characters" list, select only the base images of those characters (using paths from the updated characters metadata). This ensures only needed characters are included, reducing prompt bloat and improving focus (e.g., if a scene involves 2 out of 10 characters, send only those 2 base images).
Craft an enhanced prompt: Combine the placement's description with references to the relevant characters (e.g., "Generate [description], using these base images for character consistency: [list character names and their appearance summaries]").
If nano banana supports image-to-image or reference inputs (e.g., via control nets or multi-image prompts), attach the base images as inputs alongside the text prompt. Otherwise, describe them in-text or use a fallback like appending "match style to reference descriptions."
Call the nano banana API with this prompt and attachments/parameters optimized for consistency (e.g., higher strength on reference images, same seed/style if possible).
Save the generated image locally (e.g., "visual_[placement_id].png") and store the path in a dictionary mapping placement_id to image path/URL.




To save time in the hackathon, limit generations to 5-10 visuals per chapter or use low-resolution/quick modes. Handle failures by retrying once or using placeholders.

6. Music Generation Using ElevenLabs

Similarly, process music placements in batches.

For each music placement, use the description directly as the prompt for ElevenLabs (e.g., "Generate a 30-second horror background track with tense strings and eerie sounds").
Call the ElevenLabs API to generate short audio clips (keep durations low, e.g., 15-30 seconds, to speed up and reduce costs).
Save audio files locally (e.g., "music_[placement_id].mp3") and map placement_id to audio path in a dictionary.


No consistency mechanism needed for music, as it's scene-specific and not character-tied.

7. Final Output Compilation

Create a list of dictionaries, one per page from the original page_texts.

For each page, include: page_num, text, visuals (list of dicts with placement_id and image_path for matches on that page), music (similarly with audio_path).
Match placements to pages by parsing the placement_id (which embeds page info).


Print or dump this list as JSON to console/file. This structured output can be easily consumed for a demo (e.g., manual frontend hookup or notebook visualization).

- again i'm reminding you, it's a hackathon project, keep it simple, but cool. no need to handle endcase, and think about complex stuff.
You need to write whole thing in the script.py file.