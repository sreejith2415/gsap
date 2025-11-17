// Set up GSAP and ScrollTrigger
document.addEventListener("DOMContentLoaded", () => {
    // Check if GSAP is available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollSmoother === 'undefined') {
        console.error("GSAP, ScrollTrigger, or ScrollSmoother is not loaded. Check your script tags in index.html.");
        return;
    }

    // Register GSAP plugins
    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    // Initialize ScrollSmoother (optional, but makes the effect look better)
    ScrollSmoother.create({
        wrapper: "#smooth-wrapper",
        content: "#smooth-content",
        smooth: 1, // how long the scroll takes to catch up (in seconds)
        effects: true, // look for data-speed and data-lag attributes
    });

    // Find the main wrapper for the scroll effect
    const scrollWrap = document.querySelector(".scroll_wrap");
    if (!scrollWrap) return;

    // Get all the scroll height triggers (spacers) and the content items
    const triggers = scrollWrap.querySelectorAll(".scroll_trigger");
    const items = scrollWrap.querySelectorAll(".scroll_item");

    // Ensure we have a matching number of triggers and items
    if (triggers.length !== items.length) {
        console.error("Mismatched number of scroll_triggers and scroll_items. Check HTML structure.");
        return;
    }

    // Loop through each trigger to set up the animation
    items.forEach((item, index) => {
        const triggerElement = triggers[index];
        const nextItem = items[index + 1]; // Used to clip the current item out

        // The animation timeline for the current item
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: triggerElement,
                // The animation starts when the trigger hits the top of the viewport
                start: "top top",
                // The animation ends when the trigger leaves the bottom of the viewport (or when the next trigger starts)
                end: "bottom top", 
                scrub: true,
                // markers: true, // Uncomment for debugging scroll positions
            },
            defaults: { ease: "none" },
        });

        // 1. Reveal the current item (Clip In)
        tl.to(item, {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)", // Fully visible
        }, "start"); // Label the start point of this segment for chaining

        // If there is a next item, clip the current one away as the next trigger starts
        if (nextItem) {
            // 2. Hide the current item (Clip Out)
            // This animation starts halfway through the trigger scroll and finishes before the end.
            tl.to(item, {
                clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", // Clips up from the bottom
            }, 0.5); // Start at 50% progress of the ScrollTrigger duration

            // Note: The next item's timeline (in the next iteration of the loop) will handle its own reveal.
        } else {
            // This is the last item, it stays visible once fully revealed
            // No additional clip-out needed
        }
    });

    // We need to set the initial state of all items to be clipped out (hidden)
    gsap.set(items, {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        // The first item should actually start visible since the first animation clips it OUT.
        // We will override the first item's initial state after the loop.
    });

    // Special case: The first item should start fully visible so we can clip it *out*
    if (items.length > 0) {
        gsap.set(items[0], {
            clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
        });
        
        // Fix the timeline for the first item to clip OUT immediately
        const firstTl = ScrollTrigger.getById(triggers[0].id) ? ScrollTrigger.getById(triggers[0].id).animation : gsap.getTweensOf(items[0])[0].timeline;
        
        if (firstTl) {
             firstTl.clear(); // Clear the previous animation
             firstTl.to(items[0], {
                 clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)", // Clip OUT from bottom
             });
        }
    }
});