// CONFIGURATION
const GITHUB_USERNAME = "ibidada1";
const EMAILJS_KEY = "IDl38gelRLKEa7OvA";

// INIT EMAILJS
emailjs.init(EMAILJS_KEY);

// DOM CACHE
const body = document.body;
const toggle = document.getElementById("theme-toggle");
const typingElement = document.getElementById("typing");
const form = document.getElementById("contact-form");
const btn = document.getElementById("submit-btn");
const status = document.getElementById("form-status");

// THEME TOGGLE
toggle.addEventListener("click", () => {
    const isLight = body.classList.toggle("light");
    toggle.textContent = isLight ? "☀️" : "🌙";
    localStorage.setItem("theme", isLight ? "light" : "dark");
});

// LOAD SAVED THEME
if (localStorage.getItem("theme") === "light") {
    body.classList.add("light");
    toggle.textContent = "☀️";
}

// TYPING EFFECT
const words = ["fast websites", "SEO optimized apps", "data-driven solutions"];
let wordIdx = 0, charIdx = 0, isDeleting = false;

function type() {
    const word = words[wordIdx];

    typingElement.textContent = isDeleting
        ? word.substring(0, charIdx--)
        : word.substring(0, charIdx++);

    let speed = isDeleting ? 50 : 150;

    if (!isDeleting && charIdx === word.length + 1) {
        isDeleting = true;
        speed = 2000;
    } else if (isDeleting && charIdx === 0) {
        isDeleting = false;
        wordIdx = (wordIdx + 1) % words.length;
    }

    setTimeout(type, speed);
}
type();

// FETCH PROJECTS
async function loadProjects() {
    const container = document.getElementById("projects-container");

    try {
        const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`);
        if (!res.ok) throw new Error();

        const repos = await res.json();
        container.innerHTML = "";

        repos
            .filter(r => !r.fork && r.description)
            .slice(0, 6)
            .forEach(repo => {
                const card = document.createElement("div");
                card.className = "project-card";

                card.innerHTML = `
                    <span class="badge">${repo.language || 'JS'}</span>
                    <h3>${repo.name.replace(/-/g, ' ')}</h3>
                    <p>${repo.description}</p>
                    <div class="card-footer">
                        <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">Source Code →</a>
                    </div>
                `;

                container.appendChild(card);
            });

        // Animate once
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => e.isIntersecting && e.target.classList.add("show"));
        }, { threshold: 0.1 });

        document.querySelectorAll(".project-card").forEach(card => observer.observe(card));

    } catch {
        document.getElementById("projects-container").innerHTML =
            "<p>Error loading projects.</p>";
    }
}

loadProjects();

// FORM HANDLING (IMPROVED)
let lastSent = 0;

form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Honeypot (bot trap)
    if (this.company && this.company.value) return;

    // Rate limit (10s)
    const now = Date.now();
    if (now - lastSent < 10000) {
        status.textContent = "Wait a few seconds before sending again.";
        return;
    }

    // Validation
    if (this.message.value.trim().length < 10) {
        status.textContent = "Message too short.";
        return;
    }

    lastSent = now;

    btn.disabled = true;
    btn.textContent = "Sending...";

    try {
        await emailjs.sendForm("service_fiy6byp", "template_ky8b156", this);
        status.textContent = "✨ Message sent!";
        this.reset();
    } catch {
        status.textContent = "❌ Error sending message.";
    } finally {
        btn.disabled = false;
        btn.textContent = "Send Message";
    }
});
