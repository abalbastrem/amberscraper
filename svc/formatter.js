const tmpDir = './tmp/';
const transcriptsDir = './transcripts/';

const fs = require('fs');

async function Do(highlights) {
    // await Write(highlights);
    const sentences = await Read();
    return sentences;
}

async function Write(highlights) {
    const jsonData = JSON.stringify(highlights);
    try {
        fs.writeFileSync(tmpDir + 'highlights.json', jsonData, 'utf8');
        console.log("Successfully wrote file");
    } catch (err) {
        console.log("Error writing file", err);
    }
}

async function Read() {
    console.log('READ...');
    // const highlights = JSON.stringify(highlightsRaw);
    // const highlights = highlightsRaw;
    // console.log(highlights)
    const highlightsRaw = fs.readFileSync(tmpDir+'highlights.json', 'utf8');
    const highlights = JSON.parse(highlightsRaw);
    const timecodesRaw = fs.readFileSync(transcriptsDir+'20210812_donald_dutton_2.json', 'utf8');
    const timecodes = JSON.parse(timecodesRaw);
    const speakers = timecodes.speakers;
    const segments = timecodes.segments;
    const videofile = timecodes.filename;

    console.log(highlights);
    console.log(timecodes);

    let speakerMap = new Map();
    for (speaker of speakers) {
        speakerMap.set(speaker.spkid, speaker.name);
    }

    const regex = /[^a-zA-Z0-9áéíóúàèìòùüÁÉÍÓÚÀÈÌÒÙÜ]/g;

    // flattens timecodes into single array of objects
    let tcWords = [];
    for (segment of segments) {
        for (word of segment.words) {
            tcWords.push({
                "raw": word.text,
                "text": word.text.replace(regex, ""),
                "in": word.start,
                "out": word.end,
                "speaker": speakerMap.get(segment.speaker)
            })
        }
    }

    // flattens highlights into single array of strings
    let hlWords = [];
    for (highlight of highlights) {
        highlightSplit = highlight.split(' ');
        // iterate through each word in highlight with index
        for (let i = 0; i < highlightSplit.length; i++) {
            hlWord = {
                "raw": highlightSplit[i],
                "text": highlightSplit[i].replace(regex, ""),
                "start": false,
                "end": false
            }
            if (!hlWord.text) {
                continue;
            }
            if (i == 0) {
                hlWord.start = true;
            } else if (i == highlightSplit.length - 1) {
                hlWord.end = true;
            }
        hlWords.push(hlWord);
        }
    }

    // iterate though tcWords and hlWords to find matches
    let completeWords = [];
    let i = 0;
    let j = 0;
    while (i < tcWords.length) {
        if (tcWords[i].text == hlWords[j].text) {
            word = hlWords[j];
            word.speaker = tcWords[i].speaker;
            word.in = tcWords[i].in;
            word.out = tcWords[i].out;
            completeWords.push(word);
            i++;
            j++;
        } else {
            i++;
        }
    }

    if (hlWords.length != completeWords.length) {
        console.log("ERROR: hlWords and completeWords are not the same length");
        console.log("TCwords:\t" + tcWords.length);
        console.log("HLwords:\t" + hlWords.length);
        console.log("CompleteWords:\t" + completeWords.length);
        return;
    }

    // build sentences with speaker and timecodes
    sentences = [];
    quote = "";
    for (completeWord of completeWords) {
        if (completeWord.start) {
            quote = completeWord.raw + " ";
            tcIn = completeWord.in;
            speaker = completeWord.speaker;
        } else if (!completeWord.start && !completeWord.end) {
            quote += completeWord.raw + " ";
        } else if (completeWord.end) {
            quote += completeWord.raw;
            tcOut = completeWord.out;
            sentences.push({
                "quote": quote,
                "speaker": speaker,
                "in": tcIn,
                "out": tcOut
            });
        } 
    }

    console.log(sentences);
    return sentences;
}

// module.exports = {Write, Read};
module.exports = Do;