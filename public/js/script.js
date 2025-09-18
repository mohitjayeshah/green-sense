document.addEventListener('DOMContentLoaded', () => {

    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            // THE ONLY CHANGE IS HERE: We've gone back to 50px for a quick change.
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // This block handles the number counting animation
    const impactSection = document.querySelector('#impact');
    if (impactSection) {
        const statNumbers = document.querySelectorAll('.stat-number');
        let hasCounted = false;

        const countUp = () => {
            statNumbers.forEach(counter => {
                const target = +counter.getAttribute('data-target');
                const increment = target / 200;
                const updateCounter = () => {
                    const c = +counter.innerText;
                    if (c < target) {
                        counter.innerText = `${Math.ceil(c + increment)}`;
                        setTimeout(updateCounter, 10);
                    } else {
                        counter.innerText = target;
                    }
                };
                updateCounter();
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasCounted) {
                    countUp();
                    hasCounted = true;
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(impactSection);
    }
});