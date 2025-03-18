// Jednoduchý chatbot pro Quadrum.cz
document.addEventListener('DOMContentLoaded', function() {
    // Vytvoření chatbot tlačítka
    const chatButton = document.createElement('div');
    chatButton.classList.add('chat-button');
    chatButton.innerHTML = '<i class="fas fa-comments"></i>';
    document.body.appendChild(chatButton);

    // Vytvoření chatbot okna
    const chatWindow = document.createElement('div');
    chatWindow.classList.add('chat-window');
    chatWindow.innerHTML = `
        <div class="chat-header">
            <div class="chat-title">
                <img src="logo.png" alt="Quadrum Logo" class="chat-logo">
                <span>Quadrum Asistent</span>
            </div>
            <div class="chat-close">&times;</div>
        </div>
        <div class="chat-messages">
            <div class="message bot">
                Dobrý den! Jsem Quadrum asistent a rád vám pomůžu s jakýmkoli dotazem ohledně finančního poradenství. Jak vám mohu pomoci?
            </div>
        </div>
        <div class="chat-input-container">
            <input type="text" class="chat-input" placeholder="Napište zprávu...">
            <button class="chat-send">Odeslat</button>
        </div>
    `;
    document.body.appendChild(chatWindow);

    // Skrýt chatbot okno na začátku
    chatWindow.style.display = 'none';

    // Automatické zobrazení chatbotu po 10 sekundách
    setTimeout(() => {
        if (!sessionStorage.getItem('chatShown')) {
            chatButton.classList.add('pulse');
            sessionStorage.setItem('chatShown', 'true');
        }
    }, 10000);

    // Toggle chatbot okna při kliknutí na tlačítko
    chatButton.addEventListener('click', function() {
        if (chatWindow.style.display === 'none') {
            chatWindow.style.display = 'flex';
            chatButton.classList.remove('pulse');
        } else {
            chatWindow.style.display = 'none';
        }
    });

    // Zavření chatbot okna
    document.querySelector('.chat-close').addEventListener('click', function() {
        chatWindow.style.display = 'none';
    });

    // Základní odpovědi chatbota
    const responses = {
        'default': 'Děkuji za vaši zprávu. Náš finanční poradce vás bude kontaktovat co nejdříve. Můžete nám také zavolat na +420 123 456 789.',
        'hypotéka': 'Pro hypotéku nabízíme srovnání všech bank na trhu a nejlepší podmínky. Rádi vám připravíme nezávaznou nabídku.',
        'investice': 'Naši poradci vám pomohou s výběrem vhodné investiční strategie podle vašich cílů a rizikového profilu.',
        'pojištění': 'Nabízíme komplexní pojištění osob, majetku i odpovědnosti. Porovnáme pro vás nabídky pojišťoven a najdeme nejlepší řešení.',
        'kontakt': 'Můžete nás kontaktovat na tel. čísle +420 123 456 789 nebo e-mailem na info@quadrum.cz.',
        'schůzka': 'Pro domluvu schůzky klikněte na tlačítko "Domluvit schůzku" v horní části stránky nebo nám napište přes kontaktní formulář.'
    };

    // Odeslání zprávy
    const chatInput = document.querySelector('.chat-input');
    const chatSend = document.querySelector('.chat-send');
    const chatMessages = document.querySelector('.chat-messages');

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message === '') return;

        // Přidání zprávy uživatele
        chatMessages.innerHTML += `
            <div class="message user">
                ${message}
            </div>
        `;
        chatInput.value = '';

        // Automatické scrollování dolů
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulace "píše..."
        setTimeout(() => {
            // Výběr odpovědi
            let response = responses.default;
            for (const [key, value] of Object.entries(responses)) {
                if (message.toLowerCase().includes(key)) {
                    response = value;
                    break;
                }
            }

            // Přidání odpovědi bota
            chatMessages.innerHTML += `
                <div class="message bot">
                    ${response}
                </div>
            `;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
});
