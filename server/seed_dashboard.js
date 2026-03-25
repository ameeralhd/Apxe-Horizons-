const { sequelize, University, News } = require('./models');

async function seedDashboard() {
    try {
        await sequelize.sync();

        // Seed Universities
        const universities = [
            {
                name: 'University of Indonesia',
                country: 'Indonesia',
                location: 'Depok, Indonesia',
                description: 'The top university in Indonesia.',
                imageUrl: 'https://img.youtube.com/vi/RIzPLY_04JM/maxresdefault.jpg',
                officialLink: 'https://ui.ac.id'
            },
            {
                name: 'Bandung Institute of Technology',
                country: 'Indonesia',
                location: 'Bandung, Indonesia',
                description: 'Leading engineering school.',
                imageUrl: 'https://img.youtube.com/vi/RIzPLY_04JM/maxresdefault.jpg',
                officialLink: 'https://itb.ac.id'
            },
            {
                name: 'University of Malaya',
                country: 'Malaysia',
                location: 'Kuala Lumpur, Malaysia',
                description: 'Top research university in Malaysia.',
                imageUrl: 'https://img.youtube.com/vi/nZ9-Juwlsro/maxresdefault.jpg',
                officialLink: 'https://um.edu.my'
            },
            {
                name: 'KAUST',
                country: 'Saudi',
                location: 'Thuwal, Saudi Arabia',
                description: 'Prestigious science and technology university.',
                imageUrl: 'https://img.youtube.com/vi/MIPIfLSHWVs/maxresdefault.jpg',
                officialLink: 'https://kaust.edu.sa'
            },
            {
                name: 'Istanbul University',
                country: 'Turkey',
                location: 'Istanbul, Turkey',
                description: 'Historical university in Istanbul.',
                imageUrl: 'https://img.youtube.com/vi/RIzPLY_04JM/maxresdefault.jpg',
                officialLink: 'https://istanbul.edu.tr'
            },
            {
                name: 'Tsinghua University',
                country: 'China',
                location: 'Beijing, China',
                description: 'Top tier university in China.',
                imageUrl: 'https://img.youtube.com/vi/RIzPLY_04JM/maxresdefault.jpg',
                officialLink: 'https://tsinghua.edu.cn'
            }
        ];

        for (const uni of universities) {
            await University.findOrCreate({
                where: { name: uni.name },
                defaults: uni
            });
        }

        // Seed News
        const newsTicker = [
            {
                content: '🚀 Enrollment for Fall 2026 is now open for Indonesian students at University of Malaya! Apply now.',
                category: 'University',
                isActive: true
            }
        ];

        for (const news of newsTicker) {
            await News.findOrCreate({
                where: { content: news.content },
                defaults: news
            });
        }

        console.log('Dashboard data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding dashboard data:', error);
        process.exit(1);
    }
}

seedDashboard();
