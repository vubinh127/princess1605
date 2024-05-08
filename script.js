let audioContext = null; // Global variable to manage the audio context
let analyser = null;
let microphone = null;

document.getElementById("start").addEventListener("click", () => {
    if (audioContext === null) {
        // If audio context is not initialized, create it
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    startListening(); // Start listening for microphone input
    document.getElementById("start").style.display = "none"; // Hide "start" button
    document.getElementById("restart").classList.remove("hidden"); // Show "restart" button
});

function startListening() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((stream) => {
                if (analyser === null) {
                    // Create analyser and microphone source if not already created
                    analyser = audioContext.createAnalyser();
                    microphone = audioContext.createMediaStreamSource(stream);
                    microphone.connect(analyser);

                    analyser.fftSize = 2048; // Higher sensitivity
                }

                const bufferLength = analyser.frequencyBinCount;
                const dataArray = new Uint8Array(bufferLength);

                const candle = document.getElementsByClassName("fire");

                function checkVolume() {
                    analyser.getByteFrequencyData(dataArray);
                    const sum = dataArray.reduce((a, b) => a + b, 0);
                    const avg = sum / bufferLength;

                    if (avg > 50) {
                        // Threshold for blowing out candles
                        Array.from(candle).forEach((c) => c.classList.add("off"));
                    }

                    requestAnimationFrame(checkVolume);
                }

                checkVolume(); // Start listening
            })
            .catch((error) => {
                console.error("Error accessing microphone:", error);
            });
    } else {
        console.error("Microphone not supported.");
    }
}

// Event listener for "restart" button
document.getElementById("restart").addEventListener("click", () => {
    const candle = document.getElementsByClassName("fire");
    Array.from(candle).forEach((c) => c.classList.remove("off")); // Remove "off" to turn on candles

    // Disconnect the microphone and reset the listening state
    if (microphone !== null) {
        microphone.disconnect(); // Disconnect the audio source
        microphone = null;
    }

    analyser = null; // Reset analyser
    audioContext.close(); // Close the audio context
    audioContext = null;

    // Hide "restart" button and show "start" button again
    document.getElementById("restart").classList.add("hidden");
    document.getElementById("start").style.display = "inline-block"; // Show the "start" button
});
