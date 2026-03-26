// CONFIGURATION
const GITHUB_USERNAME = "ibidada1";
const EMAILJS_KEY = "IDl38gelRLKEa7OvA";

// Initialize EmailJS
(function () { emailjs.init(EMAILJS_KEY); })();

// THEME TOGGLE
const toggle = document.getElementById("theme-toggle");
const body = document.body;

toggle.addEventListener("click", () => {
    const isLight = body.classList.toggle("light");
    toggle.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

// Load saved theme
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
    toggle.textContent = "☀️";
}

// TYPING EFFECT
const words = ["fast websites", "SEO optimized apps", "data-driven solutions"];
let wordIdx = 0, charIdx = 0, isDeleting = false;

function type() {
    const currentWord = words[wordIdx];
    const typingElement = document.getElementById("typing");
    
    typingElement.textContent = isDeleting 
        ? currentWord.substring(0, charIdx--) 
        : currentWord.substring(0, charIdx++);

    let speed = isDeleting ? 50 : 150;

    if (!isDeleting && charIdx === currentWord.length + 1) {
        isDeleting = true;
        speed = 2000; // Pause at end
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false; 
        wordIdx = (wordIdx + 1) % words.length;
    }

    setTimeout(type, speed);
}
type();

// FETCH PROJECTS FROM GITHUB
async function loadProjects() {
    const container = document.getElementById("projects-container");
    
    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
        if (!response.ok) throw new Error();
        const repos = await response.json();

        // Clear skeletons
        container.innerHTML = "";

        repos
            .filter(repo => !repo.fork && repo.description) // Only show original work with descriptions
            .slice(0, 6)
            .forEach(repo => {
                const card = document.createElement("div");
                card.className = "project-card";
                card.innerHTML = `
                    <span class="badge">${repo.language || 'JS'}</span>
                    <h3>${repo.name.replace(/-/g, ' ')}</h3>
                    <p>${repo.description}</p>
                    <div class="card-footer">
                        <a href="${repo.html_url}" target="_blank">Source Code →</a>
                    </div>
                `;
                container.appendChild(card);
            });

        // Trigger animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) entry.target.classList.add("show");
            });
        }, { threshold: 0.1 });

        document.querySelectorAll(".project-card").forEach(card => observer.observe(card));

    } catch (err) {
        container.innerHTML = "<p>Error loading projects. Check back soon!</p>";
    }
}
loadProjects();

// FORM HANDLING
document.getElementById("contact-form").addEventListener("submit", async function(e) {
    e.preventDefault();
    const btn = document.getElementById("submit-btn");
    const status = document.getElementById("form-status");

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
        await emailjs.sendForm("service_fiy6byp", "template_ky8b156", this);
        status.innerHTML = "✨ Message sent successfully!";
        this.reset();
    } catch (err) {
        status.innerHTML = "❌ Error sending message.";
    } finally {
        btn.disabled = false;
        btn.textContent = "Send Message";
    }
});