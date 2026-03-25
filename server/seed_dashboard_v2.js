const { sequelize, University, News, VideoResource } = require('./models');

async function seedDashboardV2() {
    try {
        await sequelize.sync();

        // 1. Elite Partners (For Hero Slider)
        const elitePartners = [
            {
                name: 'University of Oxford',
                country: 'United Kingdom',
                location: 'Oxford, UK',
                description: 'The oldest university in the English-speaking world.',
                imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756ebafe3?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.ox.ac.uk',
                category: 'Elite Partner'
            },
            {
                name: 'National University of Singapore',
                country: 'Singapore',
                location: 'Singapore',
                description: 'A leading global university centered in Asia.',
                imageUrl: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.nus.edu.sg',
                category: 'Elite Partner'
            },
            {
                name: 'University of Melbourne',
                country: 'Australia',
                location: 'Melbourne, Australia',
                description: 'Australias #1 university and a world leader in education.',
                imageUrl: 'https://images.unsplash.com/photo-1523050338692-7b835a07973f?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.unimelb.edu.au',
                category: 'Elite Partner'
            },
            {
                name: 'Tsinghua University',
                country: 'China',
                location: 'Beijing, China',
                description: 'One of the most prestigious universities in China and the world.',
                imageUrl: 'https://images.unsplash.com/photo-1541829070764-84a7d30dee62?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.tsinghua.edu.cn',
                category: 'Elite Partner'
            }
        ];

        // 2. Regional Hubs (For Indonesia & Malaysia)
        const regionalHubs = [
            {
                name: 'University of Indonesia',
                country: 'Indonesia',
                location: 'Depok, Indonesia',
                description: 'The premier center of learning in Indonesia.',
                imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.ui.ac.id',
                category: 'Regional Hub'
            },
            {
                name: 'Gadjah Mada University',
                country: 'Indonesia',
                location: 'Yogyakarta, Indonesia',
                description: 'The oldest and largest institution of higher learning in Indonesia.',
                imageUrl: 'https://images.unsplash.com/photo-1525921429624-479b6a29710c?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.ugm.ac.id',
                category: 'Regional Hub'
            },
            {
                name: 'Bandung Institute of Technology',
                country: 'Indonesia',
                location: 'Bandung, Indonesia',
                description: 'The first technical higher education institution in Indonesia.',
                imageUrl: 'https://images.unsplash.com/photo-1590012357758-09d30ca78cae?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.itb.ac.id',
                category: 'Regional Hub'
            },
            {
                name: 'University of Malaya',
                country: 'Malaysia',
                location: 'Kuala Lumpur, Malaysia',
                description: 'Malaysia\'s oldest and premier university.',
                imageUrl: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.um.edu.my',
                category: 'Regional Hub'
            },
            {
                name: 'Universiti Kebangsaan Malaysia',
                country: 'Malaysia',
                location: 'Bangi, Malaysia',
                description: 'The National University of Malaysia.',
                imageUrl: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.ukm.my',
                category: 'Regional Hub'
            },
            {
                name: 'Universiti Putra Malaysia',
                country: 'Malaysia',
                location: 'Serdang, Malaysia',
                description: 'A leading research university in agriculture and forestry.',
                imageUrl: 'https://images.unsplash.com/photo-1621640167576-880998f45a6c?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.upm.edu.my',
                category: 'Regional Hub'
            }
        ];

        const allUnis = [...elitePartners, ...regionalHubs];

        for (const uni of allUnis) {
            await University.findOrCreate({
                where: { name: uni.name },
                defaults: uni
            });
        }

        // 3. Video Resources
        const videoResources = [
            {
                title: 'How to get a Full Scholarship in 2026',
                url: 'https://www.youtube.com/watch?v=RIzPLY_04JM',
                thumbnail: 'https://img.youtube.com/vi/RIzPLY_04JM/maxresdefault.jpg',
                description: 'Master the scholarship application process with our step-by-step guide.',
                category: 'Scholarship'
            },
            {
                title: 'Student Life in Malaysia',
                url: 'https://www.youtube.com/watch?v=nZ9-Juwlsro',
                thumbnail: 'https://img.youtube.com/vi/nZ9-Juwlsro/maxresdefault.jpg',
                description: 'Thinking of studying in Malaysia? Here is what to expect.',
                category: 'Student Life'
            },
            {
                title: 'Visa Interview Tips from our Experts',
                url: 'https://www.youtube.com/watch?v=MIPIfLSHWVs',
                thumbnail: 'https://img.youtube.com/vi/MIPIfLSHWVs/maxresdefault.jpg',
                description: 'Ace your visa interview with these professional tips.',
                category: 'Visa'
            }
        ];

        for (const video of videoResources) {
            await VideoResource.findOrCreate({
                where: { title: video.title },
                defaults: video
            });
        }

        console.log('Dashboard V2 data seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding dashboard V2 data:', error);
        process.exit(1);
    }
}

seedDashboardV2();
