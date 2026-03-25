const { University } = require('./models');

const spotlightUpdates = [
    {
        name: 'Tsinghua University (China)',
        isFeatured: true,
        featuredPitch: 'Ranked #1 in Asia for Engineering. Explore a world-class campus in the heart of Beijing.'
    },
    {
        name: 'University of Malaya (UM)',
        isFeatured: true,
        featuredPitch: "Malaysia's oldest and highest-ranking university. A global leader in research and innovation."
    },
    {
        name: 'Istanbul University (Turkey)',
        isFeatured: true,
        featuredPitch: 'Where history meets modern excellence. Study at the gateway between Europe and Asia.'
    },
    {
        name: 'King Saud University',
        isFeatured: true,
        featuredPitch: 'A powerhouse of Arabian education. Offering massive scholarships for international students.'
    }
];

async function seedSpotlight() {
    try {
        console.log('Seeding Weekly Spotlight data...');
        for (const update of spotlightUpdates) {
            await University.update(
                { isFeatured: true, featuredPitch: update.featuredPitch },
                { where: { name: update.name } }
            );
        }
        console.log('Successfully updated spotlight universities.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding spotlight:', err);
        process.exit(1);
    }
}

seedSpotlight();
