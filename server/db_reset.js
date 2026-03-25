const { sequelize, User, Service, ConsultantProfile, University, News, VideoResource } = require('./models');
const bcrypt = require('bcryptjs');

async function resetAndSeed() {
    try {
        console.log('Syncing database (FORCE: TRUE)...');
        await sequelize.sync({ force: true });

        // 1. Seed Users & Consultants
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        await User.create({
            name: 'Admin User',
            email: 'admin@edu.com',
            password: hashedPassword,
            role: 'admin'
        });

        const consultantsData = [
            {
                name: 'Dr. Sarah Al-Fayed',
                email: 'sarah@edu.com',
                password: hashedPassword,
                role: 'consultant',
                profile: {
                    bio: 'Former Admission Dean at Top 50 Global Universities with 15 years of experience.',
                    expertise: ['Ivy League Admissions', 'PhD Applications', 'Research Grants'],
                    availability: { "Monday": ["09:00", "14:00"], "Wednesday": ["10:00", "15:00"] }
                }
            },
            {
                name: 'James Wilson',
                email: 'james@edu.com',
                password: hashedPassword,
                role: 'consultant',
                profile: {
                    bio: 'Specialist in UK and European visa processes and scholarship strategies.',
                    expertise: ['UK & EU Visas', 'Chevening Scholarships', 'Post-Study Work Paths'],
                    availability: { "Tuesday": ["13:00", "18:00"], "Thursday": ["09:00", "12:00"] }
                }
            }
        ];

        for (const c of consultantsData) {
            const user = await User.create({
                name: c.name,
                email: c.email,
                password: c.password,
                role: c.role
            });
            await ConsultantProfile.create({
                userId: user.id,
                bio: c.profile.bio,
                expertise: c.profile.expertise,
                availability: c.profile.availability,
                rating: 4.9,
                reviewCount: 124
            });
        }

        // 2. Seed Universities (Elite & Regional)
        const universities = [
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
                name: 'University of Indonesia',
                country: 'Indonesia',
                location: 'Depok, Indonesia',
                description: 'The premier center of learning in Indonesia.',
                imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=800&q=80',
                officialLink: 'https://www.ui.ac.id',
                category: 'Regional Hub'
            }
        ];

        for (const uni of universities) {
            await University.create(uni);
        }

        // 3. Seed Videos
        const videos = [
            {
                title: 'How to get a Full Scholarship in 2026',
                url: 'https://www.youtube.com/watch?v=RIzPLY_04JM',
                thumbnail: 'https://img.youtube.com/vi/RIzPLY_04JM/maxresdefault.jpg',
                description: 'Master the scholarship application process with our step-by-step guide.',
                category: 'Scholarship'
            }
        ];

        for (const video of videos) {
            await VideoResource.create(video);
        }

        console.log('Database RESET and SEEDED successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error during database reset/seed:', error);
        process.exit(1);
    }
}

resetAndSeed();
