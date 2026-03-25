const { sequelize, User, Service, ConsultantProfile } = require('./models');
const bcrypt = require('bcryptjs');

async function seed() {
    try {
        await sequelize.sync({ force: true }); // Reset DB

        // hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('password123', salt);

        // 1. Create Admin
        await User.create({
            name: 'Admin User',
            email: 'admin@apex.com',
            password: hashedPassword,
            role: 'admin',
            isVerified: true
        });

        // 2. Create Consultants
        const consultantsData = [
            {
                name: 'Dr. Sarah Al-Fayed',
                email: 'sarah@apex.com',
                password: hashedPassword,
                role: 'consultant',
                profile: {
                    title: 'Senior Admissions Coach',
                    bio: 'Former Admission Dean at Top 50 Global Universities with 15 years of experience.',
                    expertise: ['Ivy League Admissions', 'PhD Applications', 'Research Grants'],
                    rating: 4.9,
                    reviewCount: 48,
                    profileImage: 'https://i.pravatar.cc/150?u=sarah',
                    availability: { "Monday": ["09:00", "14:00"], "Wednesday": ["10:00", "15:00"] }
                }
            },
            {
                name: 'James Wilson',
                email: 'james@apex.com',
                password: hashedPassword,
                role: 'consultant',
                profile: {
                    title: 'Senior Visa Specialist',
                    bio: 'Specialist in UK and European visa processes and scholarship strategies.',
                    expertise: ['UK & EU Visas', 'Chevening Scholarships', 'Post-Study Work Paths'],
                    rating: 4.9,
                    reviewCount: 32,
                    profileImage: 'https://i.pravatar.cc/150?u=james',
                    availability: { "Tuesday": ["13:00", "18:00"], "Thursday": ["09:00", "12:00"] }
                }
            },
            {
                name: 'Elena Rossi',
                email: 'elena@apex.com',
                password: hashedPassword,
                role: 'consultant',
                profile: {
                    title: 'Scholarship Content Expert',
                    bio: 'Career strategist helping students transition from university to global fortune 500 companies.',
                    expertise: ['Full-Ride Scholarships', 'Entrance Exams', 'Merit-Based Awards'],
                    rating: 4.9,
                    reviewCount: 26,
                    profileImage: 'https://i.pravatar.cc/150?u=elena',
                    availability: { "Monday": ["15:00", "19:00"], "Friday": ["10:00", "14:00"] }
                }
            },
            {
                name: 'Wei Chen',
                email: 'wei@apex.com',
                password: hashedPassword,
                role: 'consultant',
                profile: {
                    title: 'Admissions & Career Coach',
                    bio: 'Expert in Asian Pacific education systems and technical capability assessments.',
                    expertise: ['STEM Admissions', 'Portfolio Review', 'Technical Interviews'],
                    rating: 4.9,
                    reviewCount: 19,
                    profileImage: 'https://i.pravatar.cc/150?u=wei',
                    availability: { "Wednesday": ["14:00", "18:00"], "Saturday": ["09:00", "13:00"] }
                }
            }
        ];

        for (const c of consultantsData) {
            const user = await User.create({
                name: c.name,
                email: c.email,
                password: c.password,
                role: c.role,
                isVerified: true
            });

            await ConsultantProfile.create({
                userId: user.id,
                bio: c.profile.bio,
                title: c.profile.title,
                expertise: c.profile.expertise,
                rating: c.profile.rating,
                reviewCount: c.profile.reviewCount,
                profileImage: c.profile.profileImage,
                availability: c.profile.availability
            });
        }

        // 3. Create Services
        await Service.bulkCreate([
            {
                title: 'Scholarship Strategy Session',
                description: 'A dedicated session to map out your scholarship application strategy.',
                benefits: ['Personalized roadmap', 'List of potential scholarships', 'Application review'],
                prerequisites: ['Academic transcripts', 'CV/Resume', 'Download our Prep Checklist'],
                price: 150.00,
                duration: 60
            },
            {
                title: 'Document Verification',
                description: 'We verify your academic documents for international standards.',
                benefits: ['Fast processing', 'Certified stamp', 'Global recognition'],
                prerequisites: ['Original documents', 'Passport Copy', 'Verification Authorization Form'],
                price: 50.00,
                duration: 30
            },
            {
                title: 'Face-to-Face Consultation',
                description: 'In-person meeting with a senior consultant for comprehensive career planning.',
                benefits: ['Direct interaction', 'Detailed career mapping', 'On-spot document assessment'],
                prerequisites: ['Appointment confirmation', 'Valid ID', 'All relevant academic records'],
                price: 250.00,
                duration: 90
            }
        ]);

        console.log('Database seeded successfully!');
    } catch (err) {
        console.error('Error seeding database:', err);
    } finally {
        // We don't close sequelize here because it might hang the process depending on connection pool, 
        // but explicit close is good practice if script is standalone.
        // sequelize.close(); 
        process.exit();
    }
}

seed();
