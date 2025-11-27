// Main JavaScript for AI Automation Landing Page

const ADMIN_EMAIL = "contact@favconnected.com"; // your admin email


// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Page features
    initializeAnimations();
    initializeROICalculator();
    initializeAssessmentQuiz();
    initializeScrollEffects();
    initializeMobileMenu();
    initializeCounters();

    // ---------- AUTH STATE (Firebase) ----------
    const firebase = window.FirebaseAuth;
    if (!firebase) return; // safety if Firebase didn't load

    const { auth, onAuthStateChanged } = firebase;

    // React when user logs in / logs out
    onAuthStateChanged(auth, (user) => {
        updateNavForAuth(user);
        protectAdminPage(user);
    });

    setupLoginFormHandler();
    setupLogoutHandler();
});


// Show/hide nav items based on auth (Firebase user)
function updateNavForAuth(user) {
  const adminLink  = document.getElementById("admin-link");
  const loginLink  = document.getElementById("login-link");
  const logoutLink = document.getElementById("logout-link");

  const isAdmin = user && user.email === ADMIN_EMAIL;
  const isLoggedIn = !!user;

  if (adminLink) {
    adminLink.classList.toggle("hidden", !isAdmin);
  }
  if (loginLink) {
    loginLink.classList.toggle("hidden", isLoggedIn);
  }
  if (logoutLink) {
    logoutLink.classList.toggle("hidden", !isLoggedIn);
  }
}

// Redirect non-admins away from admin.html
function protectAdminPage(user) {
  const onAdminPage = window.location.pathname.endsWith("admin.html");
  const isAdmin = user && user.email === ADMIN_EMAIL;

  if (onAdminPage && !isAdmin) {
    window.location.href = "login.html";
  }
}

// Handle login.html form using Firebase
function setupLoginFormHandler() {
  const form = document.getElementById("login-form");
  if (!form) return; // we're not on login page

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const error = document.getElementById("login-error");

    const firebase = window.FirebaseAuth;
    if (!firebase) return;
    const { auth, signInWithEmailAndPassword } = firebase;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "admin.html";
    } catch (err) {
      console.error(err);
      if (error) error.classList.remove("hidden");
    }
  });
}

// Handle logout link with Firebase
function setupLogoutHandler() {
  const logoutLink = document.getElementById("logout-link");
  if (!logoutLink) return;

  logoutLink.addEventListener("click", async function (e) {
    e.preventDefault();

    const firebase = window.FirebaseAuth;
    if (!firebase) return;
    const { auth, signOut } = firebase;

    await signOut(auth);
    window.location.href = "index.html";
  });
}


// Animation Initialization
function initializeAnimations() {
    // Typed.js for hero headline
    if (document.getElementById('typed-headline')) {
        new Typed('#typed-headline', {
            strings: [
                'Work Smarter.',
                'Scale Faster.',
                'Automate What Slows You Down.'
            ],
            typeSpeed: 80,
            backSpeed: 50,
            backDelay: 2000,
            startDelay: 500,
            loop: false,
            showCursor: true,
            cursorChar: '|',
            onComplete: function() {
                document.querySelector('.typed-cursor').style.display = 'none';
            }
        });
    }

    // Particle background effect
    createParticleBackground();
    
    // Animate elements on page load
    anime({
        targets: '.floating',
        translateY: [-20, 0],
        opacity: [0, 1],
        duration: 1000,
        delay: anime.stagger(200),
        easing: 'easeOutQuart'
    });
}

// Particle Background Effect
function createParticleBackground() {
    const container = document.getElementById('particle-container');
    if (!container) return;

    // Create canvas for particles
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    container.appendChild(canvas);

    // Set canvas size
    function resizeCanvas() {
        canvas.width = container.offsetWidth;
        canvas.height = container.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Particle system
    const particles = [];
    const particleCount = 50;

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(49, 130, 206, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Animation loop
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections
        particles.forEach((particle, i) => {
            particles.slice(i + 1).forEach(otherParticle => {
                const dx = particle.x - otherParticle.x;
                const dy = particle.y - otherParticle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(otherParticle.x, otherParticle.y);
                    ctx.strokeStyle = `rgba(56, 178, 172, ${0.1 * (1 - distance / 100)})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }
    animate();
}

// ROI Calculator
function initializeROICalculator() {
    const hoursSlider = document.getElementById('hours-slider');
    const hoursValue = document.getElementById('hours-value');
    const teamSize = document.getElementById('team-size');
    const hourlyRate = document.getElementById('hourly-rate');
    
    const monthlyHours = document.getElementById('monthly-hours');
    const monthlySavings = document.getElementById('monthly-savings');
    const annualSavings = document.getElementById('annual-savings');
    const savingsBar = document.getElementById('savings-bar');

    if (!hoursSlider) return;

    function updateCalculator() {
        const hours = parseInt(hoursSlider.value);
        const team = parseInt(teamSize.value);
        const rate = parseInt(hourlyRate.value);

        // Update display values
        hoursValue.textContent = hours + ' hrs';

        // Calculate savings (assuming 80% efficiency and 4.33 weeks/month)
        const weeklySavings = hours * team * rate * 0.8;
        const monthlyCalc = weeklySavings * 4.33;
        const annualCalc = monthlyCalc * 12;

        // Animate counter updates
        animateCounter(monthlyHours, Math.round(monthlyCalc / rate));
        animateCounter(monthlySavings, Math.round(monthlyCalc));
        animateCounter(annualSavings, Math.round(annualCalc));

        // Update progress bar
        const maxSavings = 50000; // Maximum for visual scale
        const percentage = Math.min((monthlyCalc / maxSavings) * 100, 100);
        savingsBar.style.width = percentage + '%';
    }

    // Event listeners
    hoursSlider.addEventListener('input', updateCalculator);
    teamSize.addEventListener('change', updateCalculator);
    hourlyRate.addEventListener('input', updateCalculator);

    // Initial calculation
    updateCalculator();
}

// Counter Animation
function animateCounter(element, target) {
    if (!element) return;
    
    const start = parseInt(element.textContent.replace(/[^0-9]/g, '')) || 0;
    const duration = 1000;
    const startTime = performance.now();

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (target - start) * easeOutQuart(progress));
        
        if (element.id === 'monthly-hours') {
            element.textContent = current;
        } else {
            element.textContent = '$' + current.toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        }
    }

    requestAnimationFrame(updateCounter);
}

// Assessment Quiz
function initializeAssessmentQuiz() {
    const modal = document.getElementById('assessment-modal');
    const openBtn = document.getElementById('assessment-btn');
    const closeBtn = document.getElementById('close-modal');
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');

    if (!modal) return;

    let currentQuestion = 1;
    const totalQuestions = 4;
    const answers = {};

    // Open modal
    openBtn?.addEventListener('click', () => {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    });

    // Close modal
    closeBtn?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    function closeModal() {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Navigation
    nextBtn?.addEventListener('click', () => {
        if (validateCurrentQuestion()) {
            if (currentQuestion < totalQuestions) {
                showQuestion(currentQuestion + 1);
            } else {
                showResults();
            }
        }
    });

    prevBtn?.addEventListener('click', () => {
        if (currentQuestion > 1) {
            showQuestion(currentQuestion - 1);
        }
    });

    function showQuestion(questionNum) {
        // Hide all questions
        document.querySelectorAll('.quiz-question').forEach(q => q.classList.add('hidden'));
        
        // Show current question
        const question = document.getElementById(`question-${questionNum}`);
        if (question) {
            question.classList.remove('hidden');
        }

        currentQuestion = questionNum;
        updateProgress();
        updateButtons();
    }

    function updateProgress() {
        const progressBar = document.getElementById('progress-bar');
        const currentQuestionEl = document.getElementById('current-question');
        
        if (progressBar) {
            const percentage = (currentQuestion / totalQuestions) * 100;
            progressBar.style.width = percentage + '%';
        }
        
        if (currentQuestionEl) {
            currentQuestionEl.textContent = currentQuestion;
        }
    }

    function updateButtons() {
        if (prevBtn) {
            prevBtn.classList.toggle('hidden', currentQuestion === 1);
        }
        
        if (nextBtn) {
            nextBtn.textContent = currentQuestion === totalQuestions ? 'Get Results' : 'Next';
        }
    }

    function validateCurrentQuestion() {
        const currentQ = document.getElementById(`question-${currentQuestion}`);
        const inputs = currentQ.querySelectorAll('input[type="radio"], input[type="checkbox"]');
        const checked = currentQ.querySelectorAll('input:checked');

        if (checked.length === 0) {
            alert('Please select an answer before continuing.');
            return false;
        }

        // Store answers
        checked.forEach(input => {
            if (input.type === 'radio') {
                answers[input.name] = input.value;
            } else {
                if (!answers[input.name]) answers[input.name] = [];
                answers[input.name].push(input.value);
            }
        });

        return true;
    }

    function showResults() {
        document.querySelectorAll('.quiz-question, #quiz-progress').forEach(el => el.classList.add('hidden'));
        document.getElementById('quiz-results').classList.remove('hidden');
        
        // Generate personalized recommendation
        const recommendation = generateRecommendation(answers);
        document.getElementById('recommendation-content').innerHTML = recommendation;
        
        // Hide navigation buttons
        document.querySelector('.flex.justify-between').style.display = 'none';
    }

    function generateRecommendation(answers) {
        let recommendation = '<div class="space-y-4">';
        
        // Based on challenge
        switch (answers.challenge) {
            case 'time':
                recommendation += '<p><strong>Based on your challenge with repetitive tasks:</strong></p>';
                recommendation += '<ul class="list-disc list-inside space-y-1 text-gray-600">';
                recommendation += '<li>Implement ChatGPT automation for routine communications</li>';
                recommendation += '<li>Set up workflow automation for data processing</li>';
                recommendation += '<li>Create templates and standardized processes</li>';
                recommendation += '</ul>';
                break;
            case 'leads':
                recommendation += '<p><strong>Based on your lead generation needs:</strong></p>';
                recommendation += '<ul class="list-disc list-inside space-y-1 text-gray-600">';
                recommendation += '<li>Deploy automated lead capture systems</li>';
                recommendation += '<li>Implement nurturing email sequences</li>';
                recommendation += '<li>Set up CRM integration and scoring</li>';
                recommendation += '</ul>';
                break;
            case 'systems':
                recommendation += '<p><strong>Based on your system integration needs:</strong></p>';
                recommendation += '<ul class="list-disc list-inside space-y-1 text-gray-600">';
                recommendation += '<li>Audit and streamline your tech stack</li>';
                recommendation += '<li>Implement integration platforms (Zapier, Make)</li>';
                recommendation += '<li>Create unified dashboard and reporting</li>';
                recommendation += '</ul>';
                break;
            case 'growth':
                recommendation += '<p><strong>Based on your scaling challenges:</strong></p>';
                recommendation += '<ul class="list-disc list-inside space-y-1 text-gray-600">';
                recommendation += '<li>Design scalable automation architecture</li>';
                recommendation += '<li>Implement process documentation systems</li>';
                recommendation += '<li>Set up performance monitoring and optimization</li>';
                recommendation += '</ul>';
                break;
        }
        
        recommendation += '</div>';
        return recommendation;
    }
}

// Scroll Effects
function initializeScrollEffects() {
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero-bg');
        if (parallax) {
            const speed = scrolled * 0.5;
            parallax.style.transform = `translateY(${speed}px)`;
        }
    });
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', () => {
            // Toggle mobile menu (simplified for this demo)
            alert('Mobile menu - Navigate to contact.html to book your discovery call!');
        });
    }
}

// Counter Animation for Results Section
function initializeCounters() {
    const counters = document.querySelectorAll('.counter');
    
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounterElement(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => counterObserver.observe(counter));
}

function animateCounterElement(element, target) {
    const duration = 2000;
    const startTime = performance.now();
    const start = 0;

    function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        const current = Math.floor(start + (target - start) * easeOutQuart(progress));
        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    }

    requestAnimationFrame(updateCounter);
}

// Utility Functions
function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form validation and submission (for future forms)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('border-red-500');
            isValid = false;
        } else {
            input.classList.remove('border-red-500');
        }
    });

    return isValid;
}

// Add loading states to buttons
document.querySelectorAll('a[href="contact.html"]').forEach(btn => {
    btn.addEventListener('click', function() {
        const originalText = this.innerHTML;
        this.innerHTML = 'Loading...';
        this.style.pointerEvents = 'none';
        
        setTimeout(() => {
            this.innerHTML = originalText;
            this.style.pointerEvents = 'auto';
        }, 1000);
    });
});

// Performance optimization: Lazy load images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });

    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if needed
initializeLazyLoading();

// Analytics tracking (placeholder for future implementation)
function trackEvent(eventName, properties = {}) {
    console.log('Track Event:', eventName, properties);
    // Implement your analytics tracking here
}

// Track important user interactions
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn-primary')) {
        trackEvent('cta_click', {
            buttonText: e.target.textContent.trim(),
            page: window.location.pathname
        });
    }
    
    if (e.target.matches('#assessment-btn')) {
        trackEvent('assessment_start', {
            page: window.location.pathname
        });
    }
});

// Track quiz completion
function trackQuizCompletion(answers) {
    trackEvent('quiz_completed', {
        challenge: answers.challenge,
        hours: answers.hours,
        timeline: answers.timeline,
        page: window.location.pathname
    });
}

// Export functions for use in other files
window.AIFlow = {
    trackEvent,
    validateForm,
    animateCounter,
    createParticleBackground
};
