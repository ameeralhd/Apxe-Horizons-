const { VideoResource } = require('./models');

const studentStories = [
    {
        title: 'Mastering the UK: My Journey at Oxford',
        url: 'https://www.youtube.com/watch?v=DGLyL_W2_5g',
        thumbnail: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=400&q=80',
        description: 'From application to graduation, follow Sarah’s inspiring journey through the University of Oxford as an international student.',
        category: 'Success Story',
        author: 'Sarah Jenkins'
    },
    {
        title: 'How I Won the CSC Scholarship to Tsinghua',
        url: 'https://www.youtube.com/watch?v=6lC0Z1yX2wV',
        thumbnail: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=400&q=80',
        description: 'Elite tips on how to secure full funding for your studies in China, featuring real interview questions and prep steps.',
        category: 'Guide',
        author: 'Li Wei'
    },
    {
        title: 'Life in Istanbul: Studying in Turkey',
        url: 'https://www.youtube.com/watch?v=q0w2F2fWJ_M',
        thumbnail: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=400&q=80',
        description: 'Explore the vibrant student life, cultural heritage, and academic excellence of Istanbul from a global perspective.',
        category: 'Success Story',
        author: 'Ahmed Mousa'
    },
    {
        title: 'Mastering the SAT for Ivy League Admissions',
        url: 'https://www.youtube.com/watch?v=pZ8x7c6v5b4',
        thumbnail: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=400&q=80',
        description: 'A comprehensive guide on standardized testing requirements for top-tier US universities.',
        category: 'Guide',
        author: 'Dr. James Carter'
    }
];

async function seedStories() {
    try {
        console.log('Seeding student success stories...');
        // Clear existing to avoid messy data during dev
        await VideoResource.destroy({ where: {} });

        for (const story of studentStories) {
            await VideoResource.create(story);
        }
        console.log('Successfully seeded 4 success stories.');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding student stories:', err);
        process.exit(1);
    }
}

seedStories();
