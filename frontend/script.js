document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('spamForm');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resultContainer = document.getElementById('resultContainer');
    const resultCard = document.querySelector('.result-card');
    const resultIcon = document.getElementById('resultIcon');
    const resultLabel = document.getElementById('resultLabel');
    const confidenceBar = document.getElementById('confidenceBar');
    const confidenceText = document.getElementById('confidenceText');
    const serverStatus = document.getElementById('serverStatus');

    // CONFIG: Replace this with your actual Render URL
    const API_URL = 'https://spamemaildetectionsystem.onrender.com/predict';

    const icons = {
        spam: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
        safe: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const text = document.getElementById('emailContent').value;
        if (!text.trim()) return;

        // Reset UI & set loading state
        analyzeBtn.classList.add('loading');
        resultContainer.classList.add('hidden');
        serverStatus.classList.add('hidden');
        resultCard.classList.remove('is-spam', 'is-safe');
        confidenceBar.style.width = '0%';
        
        // Timer to show "waking up" message if request takes > 2s
        const statusTimer = setTimeout(() => {
            serverStatus.classList.remove('hidden');
        }, 2000);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Server error occurred');
            }

            // Update UI with result
            const isSpam = data.is_spam;
            const probability = data.confidence; 
            
            const confidencePercentage = isSpam ? (probability * 100) : ((1 - probability) * 100);
            
            resultCard.classList.add(isSpam ? 'is-spam' : 'is-safe');
            resultIcon.innerHTML = isSpam ? icons.spam : icons.safe;
            resultLabel.textContent = isSpam ? 'Warning: Spam Detected' : 'Safe: Not Spam';
            
            setTimeout(() => {
                confidenceBar.style.width = `${confidencePercentage.toFixed(1)}%`;
                confidenceText.textContent = `${confidencePercentage.toFixed(1)}%`;
            }, 100);

            resultContainer.classList.remove('hidden');
            resultContainer.classList.add('fade-in');
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error analyzing email: ' + error.message + '\n\nNote: If this is the first request in a while, the server might still be waking up. Please try again in a minute.');
        } finally {
            clearTimeout(statusTimer);
            serverStatus.classList.add('hidden');
            analyzeBtn.classList.remove('loading');
        }
    });
});
