const formatElevenLabsTimestamps = ({ input, minDuration }) => {
  const characters = input.characters;
  const startTimes = input.character_start_times_seconds;
  const endTimes = input.character_end_times_seconds;

  // Step 1: Combine characters into words
  let words = [];
  let wordStartTimes = [];
  let wordEndTimes = [];
  let currentWord = "";
  let currentStartTime = startTimes[0];
  let currentEndTime = endTimes[0];

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i];
    if (char !== " ") {
      if (currentWord === "") {
        currentStartTime = startTimes[i];
      }
      currentWord += char;
      currentEndTime = endTimes[i];
    } else {
      if (currentWord !== "") {
        words.push(currentWord);
        wordStartTimes.push(currentStartTime);
        wordEndTimes.push(currentEndTime);
        currentWord = "";
      }
    }
  }
  if (currentWord !== "") {
    words.push(currentWord);
    wordStartTimes.push(currentStartTime);
    wordEndTimes.push(currentEndTime);
  }

  // Step 2: Group words into chunks with a minimum duration
  let chunks = [];
  let currentChunk = [];
  let currentChunkStartTime = wordStartTimes[0];
  let currentChunkEndTime = wordEndTimes[0];

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const wordStartTime = wordStartTimes[i];
    const wordEndTime = wordEndTimes[i];

    if (currentChunk.length === 0) {
      currentChunk.push(word);
      currentChunkStartTime = wordStartTime;
      currentChunkEndTime = wordEndTime;
    } else {
      const newChunkEndTime = wordEndTime;
      const newChunkDuration = newChunkEndTime - currentChunkStartTime;

      if (newChunkDuration >= minDuration) {
        chunks.push([currentChunkStartTime, currentChunk.join(" ")]);
        currentChunk = [word];
        currentChunkStartTime = wordStartTime;
        currentChunkEndTime = wordEndTime;
      } else {
        currentChunk.push(word);
        currentChunkEndTime = newChunkEndTime;
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push([currentChunkStartTime, currentChunk.join(" ")]);
  }

  return chunks;
};

export { formatElevenLabsTimestamps };
