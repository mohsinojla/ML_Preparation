// ===== GLOBAL UTILS =====

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(a.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Back to top button
const backBtn = document.getElementById('back-to-top');
if (backBtn) {
  window.addEventListener('scroll', () => {
    backBtn.classList.toggle('show', window.scrollY > 400);
  });
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Sidebar active link highlight on scroll
function setupScrollSpy() {
  const sections = document.querySelectorAll('[data-section]');
  const links = document.querySelectorAll('.sidebar-nav a');
  if (!sections.length || !links.length) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const id = entry.target.getAttribute('data-section');
        const active = document.querySelector(`.sidebar-nav a[href="#${id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-20% 0px -70% 0px' });
  sections.forEach(s => observer.observe(s));
}

// Section collapse toggle
document.querySelectorAll('.section-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('.section').classList.toggle('collapsed');
  });
});

// Tab switching
function initTabs(containerSelector) {
  document.querySelectorAll(containerSelector || '.tabs').forEach(tabsEl => {
    tabsEl.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-tab');
        const parent = tabsEl.closest('.tab-group') || tabsEl.parentElement;
        tabsEl.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        parent.querySelectorAll('.tab-content').forEach(c => {
          c.classList.toggle('active', c.getAttribute('data-tab-content') === target);
        });
      });
    });
  });
}

// Quiz logic
function initQuiz() {
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.question-card');
      if (card.dataset.answered) return;
      card.dataset.answered = true;
      const correct = btn.dataset.correct === 'true';
      btn.classList.add(correct ? 'correct' : 'wrong');
      if (!correct) {
        card.querySelector('[data-correct="true"]')?.classList.add('correct');
      }
      const exp = card.querySelector('.explanation');
      if (exp) exp.classList.add('show');
    });
  });
}

// Solution toggle
function initSolutions() {
  document.querySelectorAll('.solution-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const sol = btn.nextElementSibling;
      const open = sol.classList.toggle('open');
      btn.textContent = open ? '🔼 Hide Solution' : '🔽 Show Step-by-Step Solution';
    });
  });
}

// Initialize all on load
document.addEventListener('DOMContentLoaded', () => {
  setupScrollSpy();
  initTabs();
  initQuiz();
  initSolutions();
});
