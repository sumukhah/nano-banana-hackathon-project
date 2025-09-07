curl -X POST "https://api.elevenlabs.io/v1/sound-generation?output_format=mp3_44100_128" \
     -H "xi-api-key: sk_97f543cc4c99f38c2fbb4cad134991cea25dcfded9c41d1c" \
     -H "Content-Type: application/json" \
     -d '{
  "text": "an horror scene where an owl is a terrific song and its makes the whole scene scary",
  "loop": true,
  "duration_seconds": 21
}'
