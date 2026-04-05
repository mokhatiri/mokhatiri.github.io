// GitHub API Configuration
const GITHUB_USERNAME = "mokhatiri";
const GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USERNAME}/repos`;

// DOM Elements
const navToggle = document.getElementById("nav-toggle");
const navMenu = document.getElementById("nav-menu");
const navbar = document.getElementById("navbar");
const navLinks = document.querySelectorAll(".nav-link");
const projectsGrid = document.getElementById("projects-grid");
const projectsFilter = document.getElementById("projects-filter");
const contactForm = document.getElementById("contact-form");
const typingText = document.getElementById("typing-text");
const repoCountEl = document.getElementById("repo-count");

// Store repositories globally for filtering
let allRepositories = [];

// Language colors mapping
const languageColors = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Vue: "#41b883",
  Go: "#00ADD8",
  "C++": "#f34b7d",
  C: "#555555",
  Shell: "#89e051",
  "Jupyter Notebook": "#DA5B0B",
  PHP: "#4F5D95",
  Ruby: "#701516",
  Rust: "#dea584",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
};

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initTypingEffect();
  fetchGitHubRepos();
  initContactForm();
  initScrollEffects();
});

// Navigation functionality
function initNavigation() {
  // Mobile menu toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Active link on scroll
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll("section[id]");
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add("active");
        } else {
          navLink.classList.remove("active");
        }
      }
    });

    // Navbar background on scroll
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Typing effect for hero section
function initTypingEffect() {
  const texts = [
    "CS Student",
    "AI Enthusiast",
    "Big Data Explorer",
    "Full Stack Developer",
    "Problem Solver",
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typeSpeed = 100;

  function type() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      typingText.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      typeSpeed = 50;
    } else {
      typingText.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      typeSpeed = 100;
    }

    if (!isDeleting && charIndex === currentText.length) {
      typeSpeed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      typeSpeed = 500;
    }

    setTimeout(type, typeSpeed);
  }

  type();
}

// Fetch GitHub repositories
async function fetchGitHubRepos() {
  try {
    const response = await fetch(`${GITHUB_API_URL}?sort=updated&per_page=100`);

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const repos = await response.json();
    allRepositories = repos.filter((repo) => !repo.fork);

    // Update repo count in about section
    if (repoCountEl) {
      repoCountEl.textContent = allRepositories.length;
    }

    displayRepositories(allRepositories);
    initFilters();
  } catch (error) {
    console.error("Error fetching repos:", error);
    projectsGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Failed to load repositories. Please try again later.</p>
            </div>
        `;
  }
}

// Display repositories
function displayRepositories(repos) {
  if (repos.length === 0) {
    projectsGrid.innerHTML = `
            <div class="loading-spinner">
                <i class="fas fa-folder-open"></i>
                <p>No repositories found.</p>
            </div>
        `;
    return;
  }

  projectsGrid.innerHTML = repos.map((repo) => createRepoCard(repo)).join("");
}

// Create repository card
function createRepoCard(repo) {
  const languageColor = languageColors[repo.language] || "#8b8b8b";
  const description = repo.description || "No description available";
  const homepage = repo.homepage
    ? `<a href="${repo.homepage}" target="_blank" rel="noopener noreferrer" aria-label="Live Demo"><i class="fas fa-external-link-alt"></i></a>`
    : "";

  return `
        <div class="project-card" data-language="${repo.language || "Other"}">
            <div class="project-header">
                <i class="fas fa-folder-open project-icon"></i>
                <div class="project-links">
                    ${homepage}
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" aria-label="View on GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                </div>
            </div>
            <div class="project-content">
                <h3 class="project-title">
                    <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a>
                </h3>
                <p class="project-description">${description}</p>
                <div class="project-meta">
                    ${
                      repo.language
                        ? `
                        <span class="project-language">
                            <span class="language-dot" style="background-color: ${languageColor}"></span>
                            ${repo.language}
                        </span>
                    `
                        : '<span class="project-language">-</span>'
                    }
                    <div class="project-stats">
                        <span><i class="fas fa-star"></i> ${repo.stargazers_count}</span>
                        <span><i class="fas fa-code-branch"></i> ${repo.forks_count}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Initialize filters dynamically based on repository languages
function initFilters() {
  // Count languages
  const languageCounts = {};
  allRepositories.forEach((repo) => {
    if (repo.language) {
      languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
    }
  });

  // Sort by count (most used first) and take top languages
  const topLanguages = Object.entries(languageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6) // Show top 6 languages
    .map(([lang]) => lang);

  // Generate filter buttons
  projectsFilter.innerHTML = `
    <button class="filter-btn active" data-filter="all">All</button>
    ${topLanguages.map((lang) => `<button class="filter-btn" data-filter="${lang}">${lang}</button>`).join("")}
  `;

  // Add event listeners to buttons
  const filterBtns = projectsFilter.querySelectorAll(".filter-btn");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Update active button
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      // Filter repositories
      const filter = btn.dataset.filter;
      let filteredRepos;

      if (filter === "all") {
        filteredRepos = allRepositories;
      } else {
        filteredRepos = allRepositories.filter(
          (repo) => repo.language === filter,
        );
      }

      displayRepositories(filteredRepos);
    });
  });
}

// Contact form handling
function initContactForm() {
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get("name");
      const email = formData.get("email");
      const subject = formData.get("subject");
      const message = formData.get("message");

      // Create mailto link
      const mailtoLink = `mailto:mohamed.khatiri2006@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

      window.location.href = mailtoLink;

      // Show feedback
      const btn = contactForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = '<i class="fas fa-check"></i> Opening Email Client...';
      btn.disabled = true;

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.disabled = false;
      }, 3000);
    });
  }
}

// Scroll effects and animations
function initScrollEffects() {
  // Intersection Observer for reveal animations
  const revealElements = document.querySelectorAll(
    ".skill-category, .project-card, .contact-item",
  );

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    },
  );

  revealElements.forEach((el) => {
    el.style.opacity = "0";
    el.style.transform = "translateY(20px)";
    el.style.transition = "opacity 0.5s ease, transform 0.5s ease";
    revealObserver.observe(el);
  });

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const offsetTop = target.offsetTop - 70;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });
}
