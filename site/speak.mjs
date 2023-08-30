import EventBridge from "https://esm.sh/@axel669/event-bridge"

const _at = (source, key, optional) => {
    if (optional === true && source === undefined) {
        return undefined
    }
    if (typeof key === "string" || key >= 0) {
        return source[key]
    }
    return source[source.length + key]
};

var _at_1 = _at;

const key = "AIzaSyCd01sS31s_q8gXkLVPUovxQJaOsV3diUU";
const url$1 = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${key}`;
const presets = {
    hachi: {
        name: "en-GB-Standard-D",
        pitch: 1,
        speakingRate: 1,
        opacity: 1
    },
    axel: {
        name: "en-US-Standard-H",
        pitch: 1.3,
        speakingRate: 0.9,
        opacity: 0.7,
    },
};
function gspeech(...args) {
    const text = args[0];
    const preset = args[1];
    const onStart = args[2];
    const onEnd = args[3];
    const voice = _at_1(presets, preset, false);
    return new Promise(async function (...args) {
        const resolve = args[0];
        const res = await fetch(url$1, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                input: {
                    text: text,
                },
                voice: {
                    languageCode: "en-gb",
                    name: voice.name,
                },
                audioConfig: {
                    audioEncoding: "MP3",
                    pitch: voice.pitch,
                    speakingRate: voice.speakingRate,
                },
            }),
        });
        const info = await res.json();
        onStart?.();
        const dataURI = `data:audio/mp3;base64,${info.audioContent}`;
        const audio = new Audio(dataURI);
        audio.addEventListener("ended", function (...args) {
            onEnd?.();
            resolve(null);
        });
        audio.play();
    })
}

const q = [];
const speaking = EventBridge()
function playNext(...args) {
    gspeech(
        _at_1(_at_1(q, 0, false), 0, false),
        _at_1(_at_1(q, 0, false), 1, false),
        function () {
            return speaking.emit("start")
        },
        function (...args) {
            q.shift();
            if (q.length === 0) {
                speaking.emit("end");
                return undefined
            }
            playNext();
        }
    );
}
export function play(...args) {
    const text = args[0];
    const preset = args[1];
    q.push([text, preset]);
    if (q.length !== 1) {
        return undefined
    }
    playNext();
}
export { speaking }
