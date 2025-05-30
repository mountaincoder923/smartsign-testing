// ************************************* Global Configs *************************************
// ───────────────────── Listing Source URL ──────────────────────
let url = "";
const chatBackend = "https://v3kooqon7vcjnyem5uf3euda2e0qzbyx.lambda-url.us-east-1.on.aws";
const voiceBackend = "https://lgvpc3tniusyh5osnv2e6efzie0iwutx.lambda-url.us-east-1.on.aws";

// ───────────────────── Particles Effect ──────────────────────
const config = {
    dotCount: 60,                  // how many dots
    colors: ['rgba(59,44,225,0.53)', 'rgba(255,0,234,0.82)'],
    dotSize: 6,                   // diameter in px
    radius: {min: 225, max: 325}, // orbit radius range in px
    speed: {                       // rotations per second
        min: 0.085,                    // slowest: full circle in 10s
        max: 0.09                     // fastest: full circle in ~3.3s
    },
    pulse: {
        min: 0.7,   // minimum scale size
        max: 1.6,  // maximum scale size
        speed: 250  // smaller = faster pulse
    }
};

// ───────────────────── Messages  ──────────────────────

const DefaultOrbMessages = "Tap for help"
// Add more to have cycle through different languages
const AltOrbMessages = [
    "Нажмите для помощи",                         // Russian
    "点击我",                                      // Chinese (Simplified, natural and popular phrasing)
    "Nhấn để được hỗ trợ",                        // Vietnamese
    "Toca para obtener ayuda",                    // Spanish (neutral Latin American phrasing)
    "도움이 필요하신가요? 눌러주세요",               // Korean (polite + imperative)
    "タップしてヘルプを表示",                         // Japanese (natural tap-to-help tone)
    "मदद के लिए टैप करें",                         // Hindi (imperative, natural)
    "اضغط للمساعدة",                               // Arabic (direct, widely understood)
    "Натисніть, щоб отримати допомогу",           // Ukrainian
    "ٹَچ کریں مدد کے لیے",                         // Farsi alt with more casual "Touch" phrasing
    "Mag-tap para sa tulong",                     // Tagalog (very natural for touchscreen prompts)
];
const DefaultInputMessage = "Ask me a question in any language";

const AltInputMessages = [
    "Задайте мне вопрос на любом языке",                   // Russian
    "用任何语言问我一个问题",                                // Chinese
    "Hãy hỏi tôi một câu bằng bất kỳ ngôn ngữ nào",        // Vietnamese
    "Hazme una pregunta en cualquier idioma",              // Spanish
    "어떤 언어로든 나에게 질문하세요!",                      // Korean
    "どの言語でも質問してください！",                          // Japanese
    "मुझसे किसी भी भाषा में सवाल पूछिए!",                  // Hindi
    "اطرح عليّ سؤالًا بأي لغة!",                            // Arabic
    "Задайте мені питання будь-якою мовою!",               // Ukrainian
    "مجھ سے کسی بھی زبان میں سوال پوچھیں!",                // Urdu
    "Magtanong ka sa akin gamit ang kahit anong wika!",   // Tagalog
];

// ───────────────────── Onload Executes ──────────────────────
document.addEventListener('DOMContentLoaded', async () => {
    url = window.srcURL;
    initParticles();
    CycleMessages(DefaultOrbMessages, AltOrbMessages);
    await loadListingData(url);
    loadFooter();
    loadBanner();
    startScroll();
});

// ──────────────── Global Store ────────────────
let ListingData = loadListingData(url); // populated once JSON is loaded
const inputBox = document.getElementById("userInput");
const maxMsgHistoryLimit = 20; // Change at your own risk. Higher values can mean higher API bills.
// ************************************* END Config *************************************


// Fetches listing data from JSON
async function loadListingData(url) {
    return fetch(url)
        .then(res => {
            if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
            return res.json();
        })
        .then(data => {
            ListingData = data;
            console.log("Listing data loaded:", ListingData);
        })
        .catch(err => {
            console.error("Failed to load listing data:", err);
        });
}

// ──────────────── Orb ────────────────
function updateOrbText(message) {
    const orbTextContainer = document.getElementById("orb-text");

    // Fade out
    orbTextContainer.classList.add("opacity-0");

    setTimeout(() => {
        // Swap content
        orbTextContainer.innerHTML = `
          <span class="text-white/90 text-4xl font-medium tracking-wide animate-fadeGlow">
            ${message}
          </span>
        `;

        // Fade back in
        orbTextContainer.classList.remove("opacity-0");
    }, 350); // Match half your transition duration
}


function CycleMessages(defaultmsg, altMessagelst) {
    updateOrbText(defaultmsg);
    let isEnglish = true;
    let currentIndex = 0;
    setInterval(() => {
        updateOrbText(altMessagelst[currentIndex]);
        if (isEnglish) {
            currentIndex = (currentIndex + 1) % altMessagelst.length;
            isEnglish = false;
        } else {
            updateOrbText(defaultmsg);
            isEnglish = true;
        }
    }, 3000); // Timeout in Ms. Increase for faster swaps
}

// ──────────────── END ────────────────

// ──────────────── Particles Animation ────────────────

function initParticles() {
    const dotsData = [];

    // Create & initialize each dot
    for (let i = 0; i < config.dotCount; i++) {
        const dot = document.createElement('div');
        dot.classList.add('orbit-dot');
        dot.style.width = `${config.dotSize}px`;
        dot.style.height = `${config.dotSize}px`;
        dot.style.margin = `${-config.dotSize / 2}px 0 0 ${-config.dotSize / 2}px`;
        dot.style.background = config.colors[i % config.colors.length];

        // random orbit radius & starting angle
        const r = config.radius.min + Math.random() * (config.radius.max - config.radius.min);
        const angle = Math.random() * Math.PI * 2;
        // convert rotations/sec → radians/sec
        const speed = (config.speed.min + Math.random() * (config.speed.max - config.speed.min)) * 2 * Math.PI;

        document.body.appendChild(dot);
        dotsData.push({el: dot, angle, radius: r, speed});
    }

    // animate with requestAnimationFrame
    let lastTime;

    function animate(now) {
        if (!lastTime) lastTime = now;
        const dt = (now - lastTime) / 1000; // seconds elapsed
        lastTime = now;

        dotsData.forEach(d => {
            d.angle = (d.angle + d.speed * dt) % (2 * Math.PI);
            const x = Math.cos(d.angle) * d.radius;
            const y = Math.sin(d.angle) * d.radius;

// Calculate pulsing scale based on time
            const pulseRange = config.pulse.max - config.pulse.min;
            const pulse =
                config.pulse.min + pulseRange * (0.5 + 0.5 * Math.sin(now / config.pulse.speed + d.radius));

// Apply transform with pulsing
            d.el.style.transform = `translate(${x}px, ${y}px) scale(${pulse})`;
        });

        requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
}


const PARTICLE_COUNT = 24;
const track = document.getElementById('particle-track');
for (let i = 0; i < PARTICLE_COUNT; i++) {
    const p = document.createElement('span');
    p.style.setProperty('--i', i);
    track.appendChild(p);
}

// ──────────────── END ────────────────


// ──────────────── ChatBot ────────────────
const orbButton = document.getElementById("chat-orb");
const chatContainer = document.getElementById("chatbox-container");

orbButton.addEventListener("click", () => { // Opens
    chatContainer.classList.remove("opacity-0", "pointer-events-none");
    CycleInputMessages(true, DefaultInputMessage, AltInputMessages);
});

function closeChatbox() {
    const chatContainer = document.getElementById("chatbox-container");
    const chatWindow = document.getElementById("chatbox-window");

// Step 1: Animate window out
    chatWindow.classList.add("opacity-0", "blur-sm", "scale-95");
    CycleInputMessages(false, DefaultInputMessage, AltInputMessages);

// Step 2: AFTER animation finishes, hide container
    setTimeout(() => {
// Hide entire container visually and functionally
        chatContainer.classList.add("opacity-0", "pointer-events-none");
        const chatBox = document.getElementById("chatBox");
        while (chatBox.children.length > 1) {
            chatBox.removeChild(chatBox.lastChild);
        }
        userInput.value = '';

// Step 3: AFTER the container is hidden, reset window for next open
// Delay ensures that we're not re-showing a fading element
        setTimeout(() => {
            chatWindow.classList.remove("opacity-0", "blur-sm", "scale-95");
        }, 650); // Don't remove too early — this is key
    }, 1000); // Match your CSS transition duration exactly

}

const chatBox = document.getElementById("chatBox");
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");


let placeholderInterval = null;

function CycleInputMessages(state, defaultmsg, AltInputMessages) {
    if (placeholderInterval !== null) {
        clearInterval(placeholderInterval); // Clear previous cycle if it exists
        placeholderInterval = null;
    }

    if (!state) return;

    let isEnglish = true;
    let currentIndex = 0;

    placeholderInterval = setInterval(() => {
        userInput.placeholder = isEnglish ? AltInputMessages[currentIndex] : defaultmsg;
        if (isEnglish) {
            currentIndex = (currentIndex + 1) % AltInputMessages.length;
        }
        isEnglish = !isEnglish;
    }, 3000);
}

chatForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    userInput.value = "";

    getChatBotReply(text)
    // setTimeout(() => {
    //     appendMessage("This is a scripted reply, but imagine this is ChatGPT answering you.", false);
    // }, 500);
});

function appendMessage(text, isUser) {
    const message = document.createElement("div");
    message.className = `flex ${isUser ? "justify-end" : "justify-start"}`;
    message.innerHTML = `
    <div class="${isUser ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"} px-4 py-2 rounded-2xl max-w-[80%]">
      ${text}
    </div>
  `;
    chatBox.appendChild(message);
    addToChatLog(text, isUser); // Logs chats for chatbot.
    chatBox.scrollTop = chatBox.scrollHeight;
}

function removeMessage(index) {
    const chatBox = document.getElementById("chatBox");

    // Get all current message bubbles (assumes each message is a direct child <div>)
    const messages = chatBox.children;

    // Only remove if at least two exist
    if (messages.length >= 2) { // Prevents removal of hello.
        chatBox.removeChild(messages[index]);  // Index shifts after first removal
    }
    chatQueue.shift();
}

// Keyboard handling
let shiftEnabled = false;
// Keyboard handling
document.getElementById("onScreenKeyboard").addEventListener("click", e => {
    if (!e.target.classList.contains("key")) return;

    const action = e.target.dataset.action;

    if (action === "backspace") {
        userInput.value = userInput.value.slice(0, -1);

    } else if (action === "submit") {
        chatForm.requestSubmit();

    } else if (action === "shift") {            // ⇧ pressed
        shiftEnabled = true;
        e.target.classList.add("ring-2", "ring-blue-400");   // visual cue
        /*  // uncomment the next two lines for CAPS‑LOCK style
        shiftEnabled = !shiftEnabled;
        e.target.classList.toggle("ring-2", shiftEnabled);
        */

    } else if (e.target.textContent === "SPACE") {
        userInput.value += " ";

    }
    else if (action === "clear") {
        userInput.value = '';

    }else {
        // Normal character key
        const ch = e.target.textContent;
        userInput.value += shiftEnabled ? ch.toUpperCase() : ch.toLowerCase();

        // reset shift after a single use (phone‑style)
        if (shiftEnabled) {
            shiftEnabled = false;
            document.querySelector('[data-action="shift"]')
                .classList.remove("ring-2", "ring-blue-400");
        }
    }

    userInput.focus();
});

// Handles main chat logic
const chatQueue = []

function addToChatLog(message, isUser) {
    if (chatQueue.length > maxMsgHistoryLimit) { // Snips history to max 20 to keep costs down.
        removeMessage(1);
        removeMessage(1);
    }

    if (isUser) {
        chatQueue.push("User: " + message + "\n");
        return;
    }
    if (!isUser) {
        chatQueue.push("Bot: " + message + "\n");
    }
}

function getChatBotReply(input) {
    disableKeyboard();
    showTypingBubble("I'm typing the answer to your question!");
    let ChatLog = "";
    for (const msg of chatQueue) {
        ChatLog += msg;
    }

    const payload = {
        context: ListingData?.homeContext || "",
        history: ChatLog || "",
        prompt: input
    };

    fetch(chatBackend, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then(data => {
            appendMessage(data.reply, false);
            enableKeyboard();
            hideTypingBubble();

        })
        .catch(err => console.error("Error from Lambda:", err));
}

// ──────────────── END ────────────────

// ──────────────── Audio Input ────────────────
const audioButton = document.getElementById('audioButton');

// ───── state
let mediaStream = null;
let mediaRecorder = null;   // for native MediaRecorder path
let audioCtx = null;   // for fallback
let scriptNode = null;   // for fallback
let wavPcmBuffers = [];     // Float32 chunks (fallback)
let mediaChunks = [];     // Blob chunks (MediaRecorder path)
let autoStopTimeoutId = null;

const RECORD_MIME = 'audio/wav';
const RECORD_FILENAME = 'recording.wav';
window.recordedAudioBlob = null;

// ───── feature detection
const supportsWavMR = window.MediaRecorder
    && MediaRecorder.isTypeSupported
    && MediaRecorder.isTypeSupported(RECORD_MIME);

// ──────────────────── start / stop ────────────────────
async function startAudioRecording() {
    document.getElementById('recordingIndicator').style.opacity = '1';
    mediaChunks = [];
    wavPcmBuffers = [];

    mediaStream = await navigator.mediaDevices.getUserMedia({audio: true});

    if (supportsWavMR) {
        mediaRecorder = new MediaRecorder(mediaStream, {mimeType: RECORD_MIME});
        mediaRecorder.ondataavailable = e => mediaChunks.push(e.data);
        mediaRecorder.onstop = onRecordingReady;
        mediaRecorder.start();
    } else {
        // fallback → collect raw PCM
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const src = audioCtx.createMediaStreamSource(mediaStream);
        scriptNode = audioCtx.createScriptProcessor(4096, 1, 1);
        scriptNode.onaudioprocess = e => {
            wavPcmBuffers.push(new Float32Array(e.inputBuffer.getChannelData(0)));
        };
        src.connect(scriptNode);
        scriptNode.connect(audioCtx.destination);
    }

    autoStopTimeoutId = setTimeout(() => stopAudioRecording(), 10_000);
    console.log('Recording started');
}

function stopAudioRecording() {
    document.getElementById('recordingIndicator').style.opacity = '0';
    if (autoStopTimeoutId) clearTimeout(autoStopTimeoutId);

    if (supportsWavMR) {
        if (mediaRecorder && mediaRecorder.state !== 'inactive') mediaRecorder.stop();
    } else {
        stopFallback();
    }

    if (mediaStream) {
        mediaStream.getTracks().forEach(t => t.stop());
        mediaStream = null;
    }
    console.log('Recording stopped');
}

function stopFallback() {
    if (!audioCtx) return;
    scriptNode.disconnect();
    audioCtx.close();

    window.recordedAudioBlob = encodeWav(wavPcmBuffers, audioCtx.sampleRate);
    onRecordingReady();
}

// ───── WAV encoder (PCM → WAV) ----------------------------------------
function encodeWav(pcmBufs, sampleRate) {
    const length = pcmBufs.reduce((s, b) => s + b.length, 0);
    const pcm16 = new Int16Array(length);
    let offset = 0;
    pcmBufs.forEach(buf => {
        for (let i = 0; i < buf.length; i++) {
            const s = Math.max(-1, Math.min(1, buf[i]));
            pcm16[offset++] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
    });

    const bytesPerSample = 2, blockAlign = bytesPerSample;
    const byteRate = sampleRate * blockAlign, dataLen = pcm16.byteLength;

    const buffer = new ArrayBuffer(44 + dataLen);
    const dv = new DataView(buffer);
    let p = 0;
    const writeStr = s => {
        for (let i = 0; i < s.length; i++) dv.setUint8(p++, s.charCodeAt(i));
    };
    const w32 = v => {
        dv.setUint32(p, v, true);
        p += 4;
    };
    const w16 = v => {
        dv.setUint16(p, v, true);
        p += 2;
    };

    writeStr('RIFF');
    w32(36 + dataLen);
    writeStr('WAVE');
    writeStr('fmt ');
    w32(16);
    w16(1);
    w16(1);
    w32(sampleRate);
    w32(byteRate);
    w16(blockAlign);
    w16(16);
    writeStr('data');
    w32(dataLen);
    new Uint8Array(buffer, 44).set(new Uint8Array(pcm16.buffer));

    return new Blob([buffer], {type: RECORD_MIME});
}

// ───── finalize
function onRecordingReady() {
    if (supportsWavMR) {
        window.recordedAudioBlob = new Blob(mediaChunks, {type: RECORD_MIME});
    }
    console.log('Audio blob stored:', window.recordedAudioBlob);
    getTranscription();
}

// ───── DOM wiring
audioButton.addEventListener('mousedown', startAudioRecording);
audioButton.addEventListener('mouseup', stopAudioRecording);
audioButton.addEventListener('touchstart', startAudioRecording);
audioButton.addEventListener('touchend', stopAudioRecording);

async function getTranscription() {
    inputBox.value = "";
    showTypingBubble("Once your question appears in the box, Press send")
    disableKeyboard();
    const audioButton = document.getElementById('audioButton');
    if (audioButton) {
        audioButton.disabled = false;
        audioButton.classList.remove("opacity-50", "cursor-not-allowed");
    }

    if (!window.recordedAudioBlob) {
        hideTypingBubble();
        enableKeyboard();
        return;
    }

    const fd = new FormData();
    fd.append('file', window.recordedAudioBlob, RECORD_FILENAME);

    const ctrl = new AbortController();
    const timer = setTimeout(() => {
        ctrl.abort();
        addToChatLog('Sorry, transcription timed out.', false);
    }, 10_000);

    try {
        const r = await fetch(voiceBackend, {method: 'POST', body: fd, signal: ctrl.signal});
        const data = await r.json();
        inputBox.value = data.text;
    } catch (e) {
        if (e.name !== 'AbortError') console.error(e);
    } finally {
        clearTimeout(timer);
        hideTypingBubble();
        enableKeyboard();
    }
}

// --- UI Helpers

function showTypingBubble(message) {
    const bubble = document.getElementById("typingBubble");
    const typingText = document.getElementById("typingText");
    if (!bubble) return;
    typingText.textContent = message;
    bubble.classList.remove("hidden");
    chatBox.scrollTop = chatBox.scrollHeight;   // keep in view
}

function hideTypingBubble() {
    const bubble = document.getElementById("typingBubble");
    if (!bubble) return;
    bubble.classList.add("hidden");
}

function disableKeyboard() {
    document.querySelectorAll('#chatForm input, #chatForm button').forEach(el => {
        el.disabled = true;
        el.classList.add("opacity-50", "cursor-not-allowed");
    });

    document.querySelectorAll("#onScreenKeyboard .key").forEach(btn => {
        btn.disabled = true;
        btn.classList.add("opacity-50", "cursor-not-allowed");
    });
}

function enableKeyboard() {
    document.querySelectorAll('#chatForm input, #chatForm button').forEach(el => {
        el.disabled = false;
        el.classList.remove("opacity-50", "cursor-not-allowed");
    });

    document.querySelectorAll("#onScreenKeyboard .key").forEach(btn => {
        btn.disabled = false;
        btn.classList.remove("opacity-50", "cursor-not-allowed");
    });
}


// ──────────────── END ────────────────

// ──────────────── Image Carousel ────────────────

// Global variables for buttons
const modal = document.getElementById("carouselModal");
const closeBtn = document.getElementById("carouselCloseBtn");

closeBtn.addEventListener("click", () => {
    modal.classList.add("opacity-0");
    // Wait for fade-out to finish before blocking interaction
    setTimeout(() => {
        modal.classList.add("pointer-events-none");
    }, 500); // match the transition duration
});


function openCarouselModal(title, images, description) {
    const track = document.getElementById("modalCarouselTrack");
    const caption = document.getElementById("modalCarouselCaption");
    const prevBtn = document.getElementById("modalPrev");
    const nextBtn = document.getElementById("modalNext");
    const titleElement = document.getElementById("carouselModalTitle");
    const staticText = document.getElementById("carouselStaticDescription");

    let idx = 0;
    track.innerHTML = "";

    if (!images.length) {
        caption.textContent = "No images available.";
        modal.classList.remove("opacity-0", "pointer-events-none");
        return;
    }

    images.forEach(({link, description}) => {
        const slide = document.createElement("div");
        slide.className = "flex-shrink-0 w-full h-full";
        slide.innerHTML = `<img src="${link}" alt="${description}" class="w-full h-full object-cover rounded-lg" />`;
        track.appendChild(slide);
    });

    titleElement.textContent = title ?? "Gallery";
    staticText.textContent = description ?? "";

    function updateCarousel() {
        track.style.transform = `translateX(-${idx * 100}%)`;
        caption.textContent = images[idx]?.caption || "";
    }

    prevBtn.onclick = () => {
        idx = (idx - 1 + images.length) % images.length;
        updateCarousel();
    };

    nextBtn.onclick = () => {
        idx = (idx + 1) % images.length;
        updateCarousel();
    };

    updateCarousel();
    modal.classList.remove("hidden");
    setTimeout(() => {
        modal.classList.remove("opacity-0", "pointer-events-none");
    }, 10); // allow DOM to register "hidden" removal before applying fade
}

// ──────────────── END ────────────────


// ──────────────── Text Modal ────────────────
const textModal = document.getElementById("textModal");
const textModalBody = document.getElementById("textModalBody");
const textModalImage = document.getElementById("textModalImage");
const imageWrapper = document.getElementById("textModalImageWrapper");

function OpenText(title, content) {
    document.getElementById("textModalTitle").textContent = title;
    textModalBody.innerHTML = content;
    // show modal with delay to trigger transition
    textModal.classList.remove("hidden");
    setTimeout(() => {
        textModal.classList.remove("opacity-0", "pointer-events-none");
    }, 15);
}

function addImageToText(image) {
    textModalImage.src = image;
    imageWrapper.classList.remove("hidden");
}

function closeText() {
    textModal.classList.add("opacity-0");
    setTimeout(() => {
        textModal.classList.add("pointer-events-none");
        textModal.classList.add("hidden");
        document.getElementById("textModalImage").src = ""; // clear it
    }, 1000); // match Tailwind duration
}

// ──────────────── END ────────────────

// ************************************* Action Logic *************************************
// ──────────────── Home Details ────────────────
const homeDetailsBtn = document.getElementById("homeDetailsBtn");
homeDetailsBtn.addEventListener("click", () => {
    openCarouselModal(ListingData.homeDetails.title, ListingData.homeDetails.images, ListingData.homeDetails.description);
})
// ──────────────── END ────────────────

// ──────────────── Owner Upgrades ────────────────
const ownerUpgradesBtn = document.getElementById("ownerUpgradesBtn");
ownerUpgradesBtn.addEventListener("click", () => {
    OpenText("Owner's Upgrades", ListingData.ownerUpgrades);
})
// ──────────────── END ────────────────

// ──────────────── Plans ────────────────
const plansBtn = document.getElementById("plansBtn");
plansBtn.addEventListener("click", () => {
    openCarouselModal("Plans", ListingData.plans.images, ListingData.plans.description);
});


// ──────────────── END ────────────────

// ──────────────── FAQs ────────────────
const faqBtn = document.getElementById("faqsBtn");
let cachedFAQ = null;

function ParseFAQ(source) {
    if (!Array.isArray(source.faq)) return "<p>No FAQs available.</p>";

    let completeFAQs = '<ul class="list-disc pl-5 space-y-2">';

    for (const item of source.faq) {
        const question = item.q?.trim() || "(No question)";
        const answer = item.a?.trim() || "(No answer)";
        completeFAQs += `<li><strong>${question}</strong><br/>${answer}</li>`;
    }

    completeFAQs += '</ul>';
    return completeFAQs;
}

faqBtn.addEventListener("click", () => {
    if (cachedFAQ === null) {
        cachedFAQ = ParseFAQ(ListingData);
    }
    OpenText("FAQs", cachedFAQ);
})

// ──────────────── END ────────────────

// ──────────────── Owner's Hello ────────────────
const ownerHello = document.getElementById("ownerHelloBtn");
ownerHello.addEventListener("click", () => {
    OpenText("Owner's Hello", ListingData.ownerHello);
})
// ──────────────── END ────────────────

// ──────────────── Make an Offer  ────────────────
const makeAnOfferBtn = document.getElementById("makeAnOfferBtn");
makeAnOfferBtn.addEventListener("click", () => {
    OpenText("Make an Offer with Homewrite today", ListingData.makeAnOffer.text);
    addImageToText(ListingData.makeAnOffer.image);
})
// ──────────────── END ────────────────

// ************************************* END Action Logic *************************************

// ************************************* START Banner Logic *************************************

function startScroll(){
    const track = document.querySelector('.banner__track');
    const text = document.querySelector('.banner__text');
    if (track && text) {
        const textWidth = text.offsetWidth;
        const speed = 100; // pixels per second
        const duration = (textWidth * 2) / speed;

        track.style.animationDuration = `${duration}s`;
}
}

function loadBanner() {
    const bannerConfig = ListingData?.banner;

    if (!bannerConfig || bannerConfig.display === false) {
        return; // Do nothing if banner is hidden
    }

    const bannerEl = document.getElementById('promoBanner');
    const bannerTrack = document.getElementById('bannerTrack');

    const text = bannerConfig.content;

    bannerTrack.innerHTML = `
    <span class="banner__text px-8">${text}</span>
    <span class="banner__text px-8">${text}</span>
  `;

    bannerEl.classList.remove('hidden');
}


    function loadFooter() {
        document.getElementById('footerHeader').textContent = ListingData.footer.header;
        document.getElementById('footerName').textContent = ListingData.footer.name;
        document.getElementById('footerTitle').innerHTML = ListingData.footer.title.replace(/\n/g, "<br>");

        const emailElem = document.getElementById('footerEmail');
        emailElem.textContent = ListingData.footer.email;
        emailElem.href = `mailto:${ListingData.footer.email}`;

        const phoneElem = document.getElementById('footerPhone');
        phoneElem.textContent = ListingData.footer.phone;
        phoneElem.href = `tel:${ListingData.footer.phone.replace(/\D/g, '')}`;
    }



