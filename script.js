// Main script file
document.addEventListener('DOMContentLoaded', () => {
    console.log('Landing page script loaded.');

    // Hero Section Animations
    const heroTitleSpans = document.querySelectorAll('.hero-title span');
    heroTitleSpans.forEach((span, index) => {
        span.style.animationDelay = `${index * 50}ms`;
    });

    // CTA Button Smooth Scroll
    const ctaButton = document.getElementById('cta-show-projects');
    const projectsSection = document.getElementById('projects');

    if (ctaButton && projectsSection) {
        ctaButton.addEventListener('click', () => {
            projectsSection.scrollIntoView({ behavior: 'smooth' });
        });

        // CTA Tilt Effect (using a simplified approach without external library first)
        ctaButton.addEventListener('mousemove', (e) => {
            const rect = ctaButton.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            const rotateX = (y / rect.height) * -10; // Max 5 degrees, inverted
            const rotateY = (x / rect.width) * 10;  // Max 5 degrees

            ctaButton.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
        });

        ctaButton.addEventListener('mouseleave', () => {
            ctaButton.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translateY(-3px)'; // Keep the hover lift
        });
         ctaButton.addEventListener('mouseout', () => { // Reset if mouse leaves window entirely
            ctaButton.style.transform = 'perspective(500px) rotateX(0deg) rotateY(0deg) translateY(0px)';
        });
    }

    // Add one more animated blob dynamically as per spec example
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        const dynamicBlob = document.createElement('div');
        dynamicBlob.classList.add('animated-blob');
        // Initial position to avoid flash at 0,0 before animation takes over
        dynamicBlob.style.transform = 'translate(10vw, 10vh) scale(1)'; 
        heroSection.appendChild(dynamicBlob);
    }

    // Projects Section Logic
    const projectsGrid = document.getElementById('projects-grid');
    const projectsError = document.getElementById('projects-error');
    const GITHUB_API_URL = 'https://api.github.com/users/cs-util-com/repos?per_page=100&sort=updated';

    async function fetchProjects() {
        try {
            const response = await fetch(GITHUB_API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const repos = await response.json();
            displayProjects(repos);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
            if (projectsError) projectsError.classList.remove('hidden');
            if (projectsGrid) projectsGrid.classList.add('hidden');
        }
    }

    function displayProjects(repos) {
        if (!projectsGrid) return;
        projectsGrid.innerHTML = ''; // Clear existing

        repos.forEach(repo => {
            const card = document.createElement('div');
            card.classList.add('project-card');

            const title = document.createElement('h3');
            title.textContent = repo.name;

            const description = document.createElement('p');
            description.textContent = repo.description || 'No description available.';

            const meta = document.createElement('div');
            meta.classList.add('meta');
            const createdAt = new Date(repo.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, ' ');
            const updatedAt = new Date(repo.updated_at).toLocaleDateString('en-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/-/g, ' ');
            meta.innerHTML = `Created: ${createdAt}<br>Updated: ${updatedAt}`;

            const link = document.createElement('a');
            link.href = repo.html_url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = 'View on GitHub';

            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(meta);
            card.appendChild(link);
            // Add website link if provided in the repo details
            if (repo.homepage) {
                const siteLink = document.createElement('a');
                siteLink.href = repo.homepage;
                siteLink.target = '_blank';
                siteLink.rel = 'noopener noreferrer';
                siteLink.textContent = 'Visit website';
                card.appendChild(siteLink);
            }
            projectsGrid.appendChild(card);
        });

        observeProjectCards();
    }

    function observeProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Tilt effect for project cards
                    entry.target.addEventListener('mousemove', (e) => {
                        const rect = entry.target.getBoundingClientRect();
                        const x = e.clientX - rect.left - rect.width / 2;
                        const y = e.clientY - rect.top - rect.height / 2;
                        const rotateX = (y / rect.height) * -14; // Max 7 degrees
                        const rotateY = (x / rect.width) * 14;  // Max 7 degrees
                        entry.target.style.setProperty('--rx', `${rotateX}deg`);
                        entry.target.style.setProperty('--ry', `${rotateY}deg`);
                    });
                    entry.target.addEventListener('mouseleave', () => {
                        entry.target.style.setProperty('--rx', '0deg');
                        entry.target.style.setProperty('--ry', '0deg');
                    });
                    observer.unobserve(entry.target); // Optional: stop observing once visible
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% of the card is visible

        projectCards.forEach(card => {
            observer.observe(card);
        });
    }

    // Blog Posts Section Logic
    const blogPostsList = document.getElementById('blog-posts-list');
    const blogError = document.getElementById('blog-error');
    const MANIFEST_URL = './repo-manifest.json'; // Assuming it's at the root

    async function fetchBlogPosts() {
        try {
            const response = await fetch(MANIFEST_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const manifest = await response.json();
            const blogFiles = manifest.filter(item => item.type === 'file' && /^posts\/\d{4}-\d{2}-\d{2}-.*\.html$/.test(item.path)); 
            
            // Sort by date (newest first) from filename
            blogFiles.sort((a, b) => {
                const dateA = a.path.match(/^posts\/(\d{4}-\d{2}-\d{2})/)[1];
                const dateB = b.path.match(/^posts\/(\d{4}-\d{2}-\d{2})/)[1];
                return new Date(dateB) - new Date(dateA);
            });

            displayBlogPosts(blogFiles);
        } catch (error) {
            console.error('Failed to fetch or parse blog posts:', error);
            if (blogError) blogError.classList.remove('hidden');
            if (blogPostsList) blogPostsList.classList.add('hidden');
        }
    }

    function displayBlogPosts(posts) {
        if (!blogPostsList) return;
        blogPostsList.innerHTML = ''; // Clear existing

        if (posts.length === 0) {
            if (blogError) {
                 blogError.innerHTML = 'No blog posts found. Check back later or <a href="https://github.com/cs-util-com/LandingPage/tree/main/posts" target="_blank" rel="noopener noreferrer">browse on GitHub</a>.';
                 blogError.classList.remove('hidden');
            }
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('div');
            card.classList.add('blog-post-card');

            const link = document.createElement('a');
            link.href = post.download_url || post.path; // Use download_url if available, else path
            // For local testing, you might want to link directly to the path if served locally
            // link.href = post.path; 
            // If using GitHub Pages, download_url might be more appropriate or a constructed URL
            // For now, let's assume the path is relative to the site root for posts.
            link.href = `./${post.path}`; 


            const titleText = post.name.replace(/\d{4}-\d{2}-\d{2}-/, '').replace(/\.html$/, '').replace(/-/g, ' ');
            const title = document.createElement('h3');
            title.textContent = titleText.charAt(0).toUpperCase() + titleText.slice(1); // Capitalize first letter

            const dateText = post.path.match(/^posts\/(\d{4}-\d{2}-\d{2})/)[1];
            const dateDisplay = document.createElement('p');
            dateDisplay.classList.add('date');
            dateDisplay.textContent = new Date(dateText).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

            link.appendChild(title);
            link.appendChild(dateDisplay);
            card.appendChild(link);
            blogPostsList.appendChild(card);
        });
    }

    // Initial data fetching
    fetchProjects();
    fetchBlogPosts(); 
});
